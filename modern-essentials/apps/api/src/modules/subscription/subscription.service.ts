import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import Razorpay from "razorpay";
import { PrismaService } from "../../common/prisma.service";
import {
  CreateSubscriptionDto,
  SubscriptionResponseDto,
} from "./subscription.dto";

// Enums from Prisma client are preferred, but using strings for consistency with Razorpay mapping
enum SubscriptionFrequency {
  WEEKLY = "WEEKLY",
  FORTNIGHTLY = "FORTNIGHTLY",
  MONTHLY = "MONTHLY",
}

enum SubscriptionStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  RENEWAL_DUE = "RENEWAL_DUE",
  DUNNING = "DUNNING",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
}

enum SubscriptionEventType {
  CREATED = "CREATED",
  ACTIVATED = "ACTIVATED",
  UPDATED = "UPDATED",
  PAUSED = "PAUSED",
  RESUMED = "RESUMED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
}

@Injectable()
export class SubscriptionService {
  private razorpay: Razorpay;
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(private prisma: PrismaService) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }

  async createSubscription(
    userId: string,
    createDto: CreateSubscriptionDto,
  ): Promise<SubscriptionResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id: createDto.productId },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    if (!product.subPrice) {
      throw new BadRequestException("This product is not available for subscription");
    }

    const frequency = (createDto.frequency || SubscriptionFrequency.WEEKLY) as SubscriptionFrequency;
    const amount = product.subPrice * createDto.quantity;

    try {
      // 1. Find or create Razorpay Plan
      const razorpayPlanId = await this.getOrCreateRazorpayPlan(product.id, amount, frequency);

      // 2. Create Subscription in Razorpay
      const razorpaySubscription = await this.razorpay.subscriptions.create({
        plan_id: razorpayPlanId,
        customer_notify: 1,
        total_count: frequency === SubscriptionFrequency.WEEKLY ? 52 : frequency === SubscriptionFrequency.FORTNIGHTLY ? 26 : 12,
        notes: {
          userId,
          productId: product.id,
          quantity: createDto.quantity.toString(),
        },
      });

      // 3. Save Subscription in DB with status PENDING
      const subscription = await this.prisma.subscription.create({
        data: {
          userId,
          productId: product.id,
          planId: await this.prisma.subscriptionPlan.findFirst({
            where: { razorpayPlanId },
            select: { id: true },
          }).then((p) => p?.id),
          quantity: createDto.quantity,
          frequency: frequency as any,
          status: SubscriptionStatus.PENDING as any,
          razorpaySubscriptionId: razorpaySubscription.id,
          nextBillingAt: new Date(), // Will be updated on activation
          addressLine1: createDto.addressLine1,
          addressLine2: createDto.addressLine2,
          city: createDto.city,
          state: createDto.state,
          postalCode: createDto.postalCode,
        },
      });

      // 4. Create initial event
      await this.prisma.subscriptionEvent.create({
        data: {
          subscriptionId: subscription.id,
          eventType: SubscriptionEventType.CREATED as any,
          description: `Subscription created for ${product.name}, awaiting mandate authentication.`,
          metadata: { razorpaySubscriptionId: razorpaySubscription.id },
        },
      });

      const response = this.mapSubscriptionToResponse(subscription, product);
      response.razorpaySubscriptionId = razorpaySubscription.id;
      response.shortUrl = razorpaySubscription.short_url;
      
      return response;
    } catch (error: any) {
      this.logger.error(`Failed to create subscription: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to create subscription: ${error.message}`);
    }
  }

  async findUserSubscriptions(userId: string) {
    const subscriptions = await this.prisma.subscription.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });

    return subscriptions.map((sub) => this.mapSubscriptionToResponse(sub, sub.product));
  }

  async getSubscriptionById(userId: string, id: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { id, userId },
      include: { product: true },
    });

    if (!subscription) {
      throw new NotFoundException("Subscription not found");
    }

    return this.mapSubscriptionToResponse(subscription, subscription.product);
  }

  async transitionStatus(
    subscriptionId: string,
    newStatus: SubscriptionStatus,
    description?: string,
    metadata?: any,
  ) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new NotFoundException("Subscription not found");
    }

    const updatedSubscription = await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: newStatus as any,
        ...(newStatus === SubscriptionStatus.ACTIVE ? { nextBillingAt: this.calculateNextBillingDate(subscription.frequency as any) } : {}),
      },
    });

    await this.prisma.subscriptionEvent.create({
      data: {
        subscriptionId,
        eventType: this.mapStatusToEventType(newStatus) as any,
        description: description || `Status transitioned to ${newStatus}`,
        metadata: metadata || {},
      },
    });

    return updatedSubscription;
  }

  private async getOrCreateRazorpayPlan(productId: string, amount: number, frequency: SubscriptionFrequency) {
    const existingPlan = await this.prisma.subscriptionPlan.findUnique({
      where: {
        productId_frequency_amount: {
          productId,
          frequency: frequency as any,
          amount,
        },
      },
    });

    if (existingPlan && existingPlan.isActive) {
      return existingPlan.razorpayPlanId;
    }

    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    const planName = `${product?.name || "Product"} - ${frequency} Subscription`;

    const razorpayPlan = await this.razorpay.plans.create({
      period: frequency === SubscriptionFrequency.MONTHLY ? "monthly" : "weekly",
      interval: frequency === SubscriptionFrequency.FORTNIGHTLY ? 2 : 1,
      item: {
        name: planName,
        amount: amount,
        currency: "INR",
        description: `Modern Essentials ${frequency} Subscription for ${product?.name}`,
      },
    });

    await this.prisma.subscriptionPlan.create({
      data: {
        productId,
        frequency: frequency as any,
        amount,
        razorpayPlanId: razorpayPlan.id,
      },
    });

    return razorpayPlan.id;
  }

  public calculateNextBillingDate(frequency: SubscriptionFrequency): Date {
    const nextBilling = new Date();
    switch (frequency) {
      case SubscriptionFrequency.WEEKLY:
        nextBilling.setDate(nextBilling.getDate() + 7);
        break;
      case SubscriptionFrequency.FORTNIGHTLY:
        nextBilling.setDate(nextBilling.getDate() + 14);
        break;
      case SubscriptionFrequency.MONTHLY:
        nextBilling.setMonth(nextBilling.getMonth() + 1);
        break;
      default:
        nextBilling.setDate(nextBilling.getDate() + 7);
    }
    return nextBilling;
  }

  private mapStatusToEventType(status: SubscriptionStatus): SubscriptionEventType {
    switch (status) {
      case SubscriptionStatus.ACTIVE: return SubscriptionEventType.ACTIVATED;
      case SubscriptionStatus.PAUSED: return SubscriptionEventType.PAUSED;
      case SubscriptionStatus.CANCELLED: return SubscriptionEventType.CANCELLED;
      case SubscriptionStatus.EXPIRED: return SubscriptionEventType.EXPIRED;
      default: return SubscriptionEventType.UPDATED;
    }
  }

  private mapSubscriptionToResponse(subscription: any, product: any): SubscriptionResponseDto {
    return {
      id: subscription.id,
      productId: subscription.productId,
      productName: product.name,
      quantity: subscription.quantity,
      frequency: subscription.frequency,
      status: subscription.status,
      nextBillingAt: subscription.nextBillingAt,
      price: product.subPrice * subscription.quantity,
      savings: Math.round(((product.price - product.subPrice) / product.price) * 100),
      razorpaySubscriptionId: subscription.razorpaySubscriptionId,
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        subPrice: product.subPrice,
        category: product.category,
      },
    };
  }
}

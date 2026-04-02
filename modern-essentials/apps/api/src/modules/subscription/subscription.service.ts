import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import Razorpay from "razorpay";
import { PrismaService } from "../../common/prisma.service";
import {
  CreateSubscriptionDto,
  SubscriptionResponseDto,
} from "./subscription.dto";
import { OrderType } from "@modern-essentials/db";

// Enums from Prisma client are preferred, but using strings for consistency with Razorpay mapping
export enum SubscriptionFrequency {
  WEEKLY = "WEEKLY",
  FORTNIGHTLY = "FORTNIGHTLY",
  MONTHLY = "MONTHLY",
}

export enum SubscriptionStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  RENEWAL_DUE = "RENEWAL_DUE",
  DUNNING = "DUNNING",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
}

export enum SubscriptionEventType {
  CREATED = "CREATED",
  ACTIVATED = "ACTIVATED",
  UPDATED = "UPDATED",
  PAUSED = "PAUSED",
  RESUMED = "RESUMED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
  PAYMENT_FAILED = "PAYMENT_FAILED",
  RENEWED = "RENEWED",
}

const VALID_TRANSITIONS: Record<SubscriptionStatus, SubscriptionStatus[]> = {
  [SubscriptionStatus.PENDING]: [SubscriptionStatus.ACTIVE],
  [SubscriptionStatus.ACTIVE]: [SubscriptionStatus.RENEWAL_DUE, SubscriptionStatus.PAUSED, SubscriptionStatus.CANCELLED],
  [SubscriptionStatus.RENEWAL_DUE]: [SubscriptionStatus.ACTIVE, SubscriptionStatus.DUNNING],
  [SubscriptionStatus.DUNNING]: [SubscriptionStatus.ACTIVE, SubscriptionStatus.CANCELLED],
  [SubscriptionStatus.PAUSED]: [SubscriptionStatus.ACTIVE],
  [SubscriptionStatus.CANCELLED]: [],
  [SubscriptionStatus.EXPIRED]: [],
};

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
    metadata?: any,
  ) {
    const sub = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { product: true },
    });

    if (!sub) {
      throw new NotFoundException("Subscription not found");
    }

    const currentStatus = sub.status as unknown as SubscriptionStatus;

    if (currentStatus === newStatus) {
      this.logger.log(`Subscription ${subscriptionId} already in status ${newStatus}. Skipping.`);
      return sub;
    }

    // Validate transition
    if (!VALID_TRANSITIONS[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Illegal transition from ${currentStatus} to ${newStatus}`,
      );
    }

    this.logger.log(`Transitioning sub ${subscriptionId} from ${currentStatus} to ${newStatus}`);

    const updateData: any = { status: newStatus as any };

    // Execute side effects
    switch (newStatus) {
      case SubscriptionStatus.ACTIVE:
        if (currentStatus === SubscriptionStatus.PENDING) {
          // Transition 1: PENDING -> ACTIVE (on subscription.activated)
          updateData.nextBillingAt = this.calculateNextBillingDate(sub.frequency as any);
          await this.createFirstOrder(sub);
          // Send welcome WhatsApp (placeholder)
        } else if (currentStatus === SubscriptionStatus.RENEWAL_DUE) {
          // Transition 3: RENEWAL_DUE -> ACTIVE (on subscription.charged)
          updateData.nextBillingAt = this.calculateNextBillingDate(sub.frequency as any);
          updateData.dunningAttempt = 0;
          await this.createRenewalOrder(sub);
        } else if (currentStatus === SubscriptionStatus.DUNNING) {
          // Transition 5: DUNNING -> ACTIVE (retry success)
          updateData.nextBillingAt = this.calculateNextBillingDate(sub.frequency as any);
          updateData.dunningAttempt = 0;
          await this.createRenewalOrder(sub);
        } else if (currentStatus === SubscriptionStatus.PAUSED) {
          // Transition 8: PAUSED -> ACTIVE
          updateData.pauseUntil = null;
        }
        break;

      case SubscriptionStatus.RENEWAL_DUE:
        // Transition 2: ACTIVE -> RENEWAL_DUE (triggered by renewal job)
        // Razorpay auto-charge will follow, handled by webhook
        break;

      case SubscriptionStatus.DUNNING:
        // Transition 4: RENEWAL_DUE -> DUNNING (on subscription.payment_failed)
        updateData.dunningAttempt = { increment: 1 };
        break;

      case SubscriptionStatus.CANCELLED:
        // Transition 6: DUNNING -> CANCELLED or Transition 9: ACTIVE -> CANCELLED
        updateData.cancelledAt = new Date();
        if (metadata?.reason) {
          updateData.cancelReason = metadata.reason;
        }
        // Cancel Razorpay subscription if not already cancelled
        try {
          await this.razorpay.subscriptions.cancel(sub.razorpaySubscriptionId!);
        } catch (e: any) {
          this.logger.warn(`Razorpay cancel failed (might already be cancelled): ${e.message}`);
        }
        break;

      case SubscriptionStatus.PAUSED:
        // Transition 7: ACTIVE -> PAUSED
        if (metadata?.pauseUntil) {
          updateData.pauseUntil = new Date(metadata.pauseUntil);
        }
        break;
    }

    const updatedSub = await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: updateData,
    });

    await this.prisma.subscriptionEvent.create({
      data: {
        subscriptionId,
        eventType: this.mapStatusToEventType(newStatus) as any,
        description: `Status transitioned from ${currentStatus} to ${newStatus}`,
        metadata: metadata || {},
      },
    });

    return updatedSub;
  }

  private async createFirstOrder(sub: any) {
    return this.prisma.order.create({
      data: {
        userId: sub.userId,
        subscriptionId: sub.id,
        type: OrderType.SUBSCRIPTION_RENEWAL,
        status: "PAID",
        total: sub.product.subPrice * sub.quantity,
        addressLine1: sub.addressLine1,
        addressLine2: sub.addressLine2,
        city: sub.city,
        state: sub.state,
        postalCode: sub.postalCode,
        items: {
          create: {
            productId: sub.productId,
            qty: sub.quantity,
            price: sub.product.subPrice,
            total: sub.product.subPrice * sub.quantity,
          },
        },
      },
    });
  }

  async createRenewalOrder(sub: any) {
    // Refresh product price to current price (per §5.2)
    const product = await this.prisma.product.findUnique({
      where: { id: sub.productId },
    });

    if (!product) throw new Error("Product not found for renewal order");

    return this.prisma.order.create({
      data: {
        userId: sub.userId,
        subscriptionId: sub.id,
        type: OrderType.SUBSCRIPTION_RENEWAL,
        status: "PAID",
        total: product.subPrice * sub.quantity,
        addressLine1: sub.addressLine1,
        addressLine2: sub.addressLine2,
        city: sub.city,
        state: sub.state,
        postalCode: sub.postalCode,
        items: {
          create: {
            productId: sub.productId,
            qty: sub.quantity,
            price: product.subPrice,
            total: product.subPrice * sub.quantity,
          },
        },
      },
    });
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
      case SubscriptionStatus.DUNNING: return SubscriptionEventType.PAYMENT_FAILED;
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

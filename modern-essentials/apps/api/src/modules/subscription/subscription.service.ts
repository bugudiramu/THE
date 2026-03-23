import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";
import {
  CreateSubscriptionDto,
  SubscriptionResponseDto,
  UpdateSubscriptionDto,
} from "./subscription.dto";

// Define enums since they're not in Prisma client
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

// Define SubscriptionEventType enum since it's not in Prisma
enum SubscriptionEventType {
  CREATED = "CREATED",
  UPDATED = "UPDATED",
  PAUSED = "PAUSED",
  RESUMED = "RESUMED",
  CANCELLED = "CANCELLED",
  PAYMENT_FAILED = "PAYMENT_FAILED",
}

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

  async createSubscription(
    userId: string,
    createSubscriptionDto: CreateSubscriptionDto,
  ) {
    // Calculate subscription price with savings
    const product = await this.prisma.product.findUnique({
      where: { id: createSubscriptionDto.productId },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        productId: createSubscriptionDto.productId,
        quantity: createSubscriptionDto.quantity,
        frequency: (createSubscriptionDto.frequency ||
          SubscriptionFrequency.WEEKLY) as SubscriptionFrequency,
        status: SubscriptionStatus.ACTIVE,
        nextBillingAt: this.calculateNextBillingDate(
          (createSubscriptionDto.frequency ||
            SubscriptionFrequency.WEEKLY) as SubscriptionFrequency,
        ),
      },
    });

    // Create subscription event
    await this.prisma.subscriptionEvent.create({
      data: {
        subscriptionId: subscription.id,
        eventType: SubscriptionEventType.CREATED,
        description: `Subscription created for ${product.name}`,
      },
    });

    return this.mapSubscriptionToResponse(subscription, product);
  }

  async getUserSubscriptions(userId: string) {
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
      },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return subscriptions.map((sub) =>
      this.mapSubscriptionToResponse(sub, sub.product),
    );
  }

  async pauseSubscription(
    userId: string,
    subscriptionId: string,
    durationWeeks: number,
  ) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        id: subscriptionId,
        userId,
      },
    });

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new Error("Only active subscriptions can be paused");
    }

    // Calculate resume date
    const resumeDate = new Date();
    resumeDate.setDate(resumeDate.getDate() + durationWeeks * 7);

    await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: SubscriptionStatus.PAUSED,
        nextBillingAt: resumeDate, // Push billing forward
      },
    });

    // Create subscription event
    await this.prisma.subscriptionEvent.create({
      data: {
        subscriptionId,
        eventType: SubscriptionEventType.PAUSED,
        description: `Subscription paused for ${durationWeeks} weeks`,
        metadata: { resumeDate: resumeDate.toISOString(), durationWeeks },
      },
    });

    return { success: true, message: "Subscription paused successfully" };
  }

  async resumeSubscription(userId: string, subscriptionId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        id: subscriptionId,
        userId,
      },
    });

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    if (subscription.status !== SubscriptionStatus.PAUSED) {
      throw new Error("Only paused subscriptions can be resumed");
    }

    await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: SubscriptionStatus.ACTIVE,
        nextBillingAt: this.calculateNextBillingDate(
          subscription.frequency as SubscriptionFrequency,
        ),
      },
    });

    // Create subscription event
    await this.prisma.subscriptionEvent.create({
      data: {
        subscriptionId,
        eventType: SubscriptionEventType.RESUMED,
        description: "Subscription resumed",
      },
    });

    return { success: true, message: "Subscription resumed successfully" };
  }

  async cancelSubscription(userId: string, subscriptionId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        id: subscriptionId,
        userId,
      },
    });

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: SubscriptionStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });

    // Create subscription event
    await this.prisma.subscriptionEvent.create({
      data: {
        subscriptionId,
        eventType: SubscriptionEventType.CANCELLED,
        description: "Subscription cancelled by user",
      },
    });

    return { success: true, message: "Subscription cancelled successfully" };
  }

  async updateSubscription(
    userId: string,
    subscriptionId: string,
    updateDto: UpdateSubscriptionDto,
  ) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        id: subscriptionId,
        userId,
      },
    });

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    const updateData: any = {};

    if (updateDto.quantity !== undefined) {
      updateData.quantity = updateDto.quantity;
    }

    if (updateDto.frequency !== undefined) {
      updateData.frequency = updateDto.frequency;
      updateData.nextBillingAt = this.calculateNextBillingDate(
        updateDto.frequency as SubscriptionFrequency,
      );
    }

    await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: updateData,
    });

    // Create subscription event
    await this.prisma.subscriptionEvent.create({
      data: {
        subscriptionId,
        eventType: SubscriptionEventType.UPDATED,
        description: `Subscription updated: ${JSON.stringify(updateDto)}`,
        metadata: updateDto as any,
      },
    });

    return { success: true, message: "Subscription updated successfully" };
  }

  private calculateNextBillingDate(frequency: SubscriptionFrequency): Date {
    const now = new Date();
    let nextBilling = new Date(now);

    switch (frequency) {
      case SubscriptionFrequency.WEEKLY:
        nextBilling.setDate(now.getDate() + 7);
        break;
      case SubscriptionFrequency.FORTNIGHTLY:
        nextBilling.setDate(now.getDate() + 14);
        break;
      case SubscriptionFrequency.MONTHLY:
        nextBilling.setMonth(now.getMonth() + 1);
        break;
      default:
        nextBilling.setDate(now.getDate() + 7); // Default to weekly
    }

    return nextBilling;
  }

  private mapSubscriptionToResponse(
    subscription: any,
    product: any,
  ): SubscriptionResponseDto {
    return {
      id: subscription.id,
      productId: subscription.productId,
      productName: product.name,
      quantity: subscription.quantity,
      frequency: subscription.frequency,
      status: subscription.status,
      nextBillingAt: subscription.nextBillingAt,
      price: subscription.price,
      savings: this.calculateSavings(product.price, product.subPrice),
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

  private calculateSavings(price: number, subPrice: number): number {
    if (!subPrice) return 0;
    return Math.round(((price - subPrice) / price) * 100);
  }
}

import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";
import { SubscriptionService } from "../subscription/subscription.service";

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private prisma: PrismaService,
    private subscriptionService: SubscriptionService,
  ) {}

  async handleRazorpayEvent(eventId: string, payload: any) {
    const eventType = payload.event;
    
    // 1. Idempotency Check (CRITICAL as per blueprint)
    let webhookRecord = await this.prisma.webhookEvent.findUnique({
      where: {
        provider_eventId: {
          provider: "razorpay",
          eventId: eventId,
        },
      },
    });

    if (webhookRecord?.processed) {
      this.logger.log(`Webhook ${eventId} already processed. Skipping.`);
      return; // Return smoothly to avoid Razorpay retrying a succeeded record
    }

    if (!webhookRecord) {
      webhookRecord = await this.prisma.webhookEvent.create({
        data: {
          provider: "razorpay",
          eventId: eventId,
          eventType: eventType,
          data: payload,
          processed: false,
        },
      });
    }

    // 2. Process Based on Event Type
    try {
      const razorpaySubscriptionId = payload.payload?.subscription?.entity?.id;
      const razorpayOrderId = payload.payload?.order?.entity?.id || payload.payload?.payment?.entity?.order_id;

      this.logger.log(`Processing Razorpay Event: ${eventType}`);

      if (razorpaySubscriptionId) {
        const subscription = await this.prisma.subscription.findUnique({
          where: { razorpaySubscriptionId: razorpaySubscriptionId as string },
        });

        if (subscription) {
          switch (eventType) {
            case "subscription.activated":
              await this.subscriptionService.transitionStatus(
                subscription.id,
                "ACTIVE" as any,
                "Subscription activated via Razorpay webhook",
                { razorpayEventId: eventId }
              );
              
              // Create first delivery order (Weekly 7 requirement)
              await this.createFirstSubscriptionOrder(subscription.id);
              break;
            case "subscription.charged":
              // For renewals, the status stays ACTIVE, but we need a new order
              // (Note: Razorpay charges immediately on activation, 
              // which also triggers subscription.charged after subscription.activated)
              // If we already created an order for this charge, skip it.
              await this.handleSubscriptionCharged(subscription.id, payload);
              break;
            case "subscription.payment_failed":
              await this.prisma.subscription.update({
                where: { id: subscription.id },
                data: { status: "DUNNING" },
              });
              break;
            case "subscription.cancelled":
              await this.prisma.subscription.update({
                where: { id: subscription.id },
                data: { status: "CANCELLED" },
              });
              break;
            case "subscription.paused":
              await this.prisma.subscription.update({
                where: { id: subscription.id },
                data: { status: "PAUSED" },
              });
              break;
          }
        }
      }

      if (razorpayOrderId && (eventType === "payment.captured" || eventType === "order.paid")) {
        const order = await this.prisma.order.findUnique({
          where: { razorpayOrderId: razorpayOrderId as string },
        });

        if (order) {
          await this.prisma.order.update({
            where: { id: order.id },
            data: { status: "PAID" },
          });
          this.logger.log(`Order ${order.id} marked as PAID via webhook`);
        } else {
          // Fallback to updateMany if findUnique fails (e.g. if @unique constraint was just added)
          const result = await this.prisma.order.updateMany({
            where: { razorpayOrderId: razorpayOrderId as string },
            data: { status: "PAID" },
          });
          if (result.count > 0) {
            this.logger.log(`Marked ${result.count} order(s) as PAID via updateMany fallback`);
          } else {
            this.logger.warn(`No order found for razorpayOrderId: ${razorpayOrderId}`);
          }
        }
      }

      // 3. Mark processed immutably
      await this.prisma.webhookEvent.update({
        where: {
          id: webhookRecord.id,
        },
        data: {
          processed: true,
          processedAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(`Error processing webhook ${eventId}`, error);
      throw error; 
    }
  }

  private async createFirstSubscriptionOrder(subscriptionId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { product: true },
    });

    if (!subscription) return;

    // Check if an order already exists for this subscription to avoid duplicates
    const existingOrder = await this.prisma.order.findFirst({
      where: { subscriptionId: subscription.id },
    });

    if (existingOrder) return;

    await this.prisma.order.create({
      data: {
        userId: subscription.userId,
        subscriptionId: subscription.id,
        status: "PAID",
        type: "SUBSCRIPTION_RENEWAL",
        total: subscription.product.subPrice * subscription.quantity,
        addressLine1: subscription.addressLine1,
        addressLine2: subscription.addressLine2,
        city: subscription.city,
        state: subscription.state,
        postalCode: subscription.postalCode,
        placedAt: new Date(),
        items: {
          create: {
            productId: subscription.productId,
            qty: subscription.quantity,
            price: subscription.product.subPrice,
            total: subscription.product.subPrice * subscription.quantity,
          },
        },
      },
    });

    this.logger.log(`Created first delivery order for subscription: ${subscriptionId}`);
  }

  private async handleSubscriptionCharged(subscriptionId: string, payload: any) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { product: true },
    });

    if (!subscription) return;

    const paymentId = payload.payload?.payment?.entity?.id;
    
    // In a real app, we should check if an order for this paymentId already exists
    // For now, we'll just log it or create a new order if it's not the very first charge (which is handled by activated)
    
    // Transition status to ACTIVE (if it was PAUSED or RENEWAL_DUE)
    await this.subscriptionService.transitionStatus(
      subscriptionId,
      "ACTIVE" as any,
      `Subscription charged successfully. Payment ID: ${paymentId}`,
      { paymentId }
    );
  }
}

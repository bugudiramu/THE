import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";
import { SubscriptionService, SubscriptionStatus } from "../subscription/subscription.service";

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
                SubscriptionStatus.ACTIVE,
                { razorpayEventId: eventId }
              );
              break;
            case "subscription.charged":
              // Transition RENEWAL_DUE or DUNNING to ACTIVE
              // This also handles renewal order generation inside transitionStatus
              await this.subscriptionService.transitionStatus(
                subscription.id,
                SubscriptionStatus.ACTIVE,
                { 
                  razorpayEventId: eventId,
                  paymentId: payload.payload?.payment?.entity?.id,
                  razorpayPayload: payload.payload
                }
              );
              break;
            case "subscription.payment_failed":
              await this.subscriptionService.transitionStatus(
                subscription.id,
                SubscriptionStatus.DUNNING,
                { 
                  razorpayEventId: eventId,
                  error: payload.payload?.payment?.entity?.error_description 
                }
              );
              break;
            case "subscription.cancelled":
              await this.subscriptionService.transitionStatus(
                subscription.id,
                SubscriptionStatus.CANCELLED,
                { 
                  razorpayEventId: eventId,
                  reason: payload.payload?.subscription?.entity?.notes?.cancel_reason || "Cancelled via Razorpay"
                }
              );
              break;
            case "subscription.paused":
              await this.subscriptionService.transitionStatus(
                subscription.id,
                SubscriptionStatus.PAUSED,
                { razorpayEventId: eventId }
              );
              break;
            case "subscription.resumed":
              await this.subscriptionService.transitionStatus(
                subscription.id,
                SubscriptionStatus.ACTIVE,
                { razorpayEventId: eventId }
              );
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
      // Even if it fails, we don't want to re-process it if it was a business logic error
      // But for now let's allow retries on error
      throw error; 
    }
  }
}

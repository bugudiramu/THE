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
    
    return await this.prisma.$transaction(async (tx) => {
      // 1. Idempotency Check (CRITICAL as per blueprint)
      // Use raw query for FOR UPDATE lock on the record
      // First ensure the record exists (using upsert or try-create)
      
      let webhookRecord;
      try {
        webhookRecord = await tx.webhookEvent.create({
          data: {
            provider: "razorpay",
            eventId: eventId,
            eventType: eventType,
            data: payload,
            processed: false,
          },
        });
      } catch (e) {
        // If unique constraint fails, it already exists
        webhookRecord = await tx.webhookEvent.findUnique({
          where: {
            provider_eventId: {
              provider: "razorpay",
              eventId: eventId,
            },
          },
        });
      }

      if (!webhookRecord) {
        throw new Error(`Could not find or create webhook record for ${eventId}`);
      }

      // Lock the record for update to prevent concurrent processing
      await tx.$executeRaw`SELECT id FROM webhook_events WHERE id = ${webhookRecord.id} FOR UPDATE`;
      
      // Re-fetch to check processed status after locking
      const lockedRecord = await tx.webhookEvent.findUnique({
        where: { id: webhookRecord.id },
      });

      if (lockedRecord?.processed) {
        this.logger.log(`Webhook ${eventId} already processed. Skipping.`);
        return;
      }

      // 2. Process Based on Event Type
      try {
        const razorpaySubscriptionId = payload.payload?.subscription?.entity?.id;
        const razorpayOrderId = payload.payload?.order?.entity?.id || payload.payload?.payment?.entity?.order_id;

        this.logger.log(`Processing Razorpay Event: ${eventType}`);

        if (razorpaySubscriptionId) {
          const subscription = await tx.subscription.findUnique({
            where: { razorpaySubscriptionId: razorpaySubscriptionId as string },
          });

          if (subscription) {
            switch (eventType) {
              case "subscription.activated":
                await this.subscriptionService.transitionStatus(
                  subscription.id,
                  SubscriptionStatus.ACTIVE,
                  { razorpayEventId: eventId },
                  tx
                );
                break;
              case "subscription.charged":
                await this.subscriptionService.transitionStatus(
                  subscription.id,
                  SubscriptionStatus.ACTIVE,
                  { 
                    razorpayEventId: eventId,
                    paymentId: payload.payload?.payment?.entity?.id,
                    razorpayPayload: payload.payload
                  },
                  tx
                );
                break;
              case "subscription.payment_failed":
                await this.subscriptionService.transitionStatus(
                  subscription.id,
                  SubscriptionStatus.DUNNING,
                  { 
                    razorpayEventId: eventId,
                    error: payload.payload?.payment?.entity?.error_description 
                  },
                  tx
                );
                break;
              case "subscription.cancelled":
                await this.subscriptionService.transitionStatus(
                  subscription.id,
                  SubscriptionStatus.CANCELLED,
                  { 
                    razorpayEventId: eventId,
                    reason: payload.payload?.subscription?.entity?.notes?.cancel_reason || "Cancelled via Razorpay"
                  },
                  tx
                );
                break;
              case "subscription.paused":
                await this.subscriptionService.transitionStatus(
                  subscription.id,
                  SubscriptionStatus.PAUSED,
                  { razorpayEventId: eventId },
                  tx
                );
                break;
              case "subscription.resumed":
                await this.subscriptionService.transitionStatus(
                  subscription.id,
                  SubscriptionStatus.ACTIVE,
                  { razorpayEventId: eventId },
                  tx
                );
                break;
            }
          }
        }

        if (razorpayOrderId && (eventType === "payment.captured" || eventType === "order.paid")) {
          const order = await tx.order.findUnique({
            where: { razorpayOrderId: razorpayOrderId as string },
          });

          if (order) {
            await tx.order.update({
              where: { id: order.id },
              data: { status: "PAID" },
            });
            this.logger.log(`Order ${order.id} marked as PAID via webhook`);
          }
        }

        // 3. Mark processed immutably
        await tx.webhookEvent.update({
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
        // Rethrow to roll back the transaction
        throw error; 
      }
    });
  }
}

import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private prisma: PrismaService,
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
      const subscriptionEntity = payload.payload?.subscription?.entity;

      // The mapping from Razorpay Sub ID back to our internal ID isn't directly on the Prisma schema right now, 
      // but assuming the `notes` field or similar holds our `internalId`, or we rely on a future mapping column.
      // For now, we mock the transition lookup.
      const internalSubId = subscriptionEntity?.notes?.internalId || "mock-sub-id";

      this.logger.log(`Processing Razorpay Event: ${eventType} for sub ${internalSubId}`);

      if (internalSubId !== "mock-sub-id") {
        switch (eventType) {
          case "subscription.activated":
            await this.prisma.subscription.update({
              where: { id: internalSubId },
              data: { status: "ACTIVE" },
            });
            break;
          case "subscription.charged":
            // Renewal successful
            await this.prisma.subscription.update({
              where: { id: internalSubId },
              data: { status: "ACTIVE" },
            });
            break;
          case "subscription.payment_failed":
            // Enter dunning
            await this.prisma.subscription.update({
              where: { id: internalSubId },
              data: { status: "DUNNING" },
            });
            // Note: Would queue BullMQ dunning job here
            break;
          case "subscription.cancelled":
            await this.prisma.subscription.update({
              where: { id: internalSubId },
              data: { status: "CANCELLED" },
            });
            break;
          case "subscription.paused":
            await this.prisma.subscription.update({
              where: { id: internalSubId },
              data: { status: "PAUSED" },
            });
            break;
          default:
            this.logger.log(`Unhandled webhook event type: ${eventType}`);
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
}

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
              await this.prisma.subscription.update({
                where: { id: subscription.id },
                data: { status: "ACTIVE" },
              });
              break;
            case "subscription.charged":
              await this.prisma.subscription.update({
                where: { id: subscription.id },
                data: { status: "ACTIVE" },
              });
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
}

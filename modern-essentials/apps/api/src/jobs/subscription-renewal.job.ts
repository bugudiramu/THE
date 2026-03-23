import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { Logger } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";

@Processor("subscription-renewal")
export class SubscriptionRenewalProcessor extends WorkerHost {
  private readonly logger = new Logger(SubscriptionRenewalProcessor.name);

  constructor(private prisma: PrismaService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing subscription renewal job ${job.id}`);

    // Blueprint:
    // "active -> renewal_due | BullMQ job fires on next_billing_at | Charge via Razorpay."
    // (Note: with Razorpay subscriptions, Razorpay auto-charges, so transitioning to
    // RENEWAL_DUE essentially marks our system as 'waiting for payment.captured' webhook)

    const dueSubscriptions = await this.prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        nextBillingAt: { lte: new Date() },
      },
    });

    this.logger.log(
      `Found ${dueSubscriptions.length} subscriptions due for renewal.`,
    );

    for (const sub of dueSubscriptions) {
      await this.prisma.subscription.update({
        where: { id: sub.id },
        data: { status: "RENEWAL_DUE" },
      });

      // Log the event immutably
      await this.prisma.subscriptionEvent.create({
        data: {
          subscriptionId: sub.id,
          eventType: "UPDATED",
          description: "Subscription marked as RENEWAL_DUE, awaiting Razorpay webhook.",
        },
      });

      this.logger.log(`Marked subscription ${sub.id} as RENEWAL_DUE.`);
    }

    return { processed: dueSubscriptions.length };
  }
}

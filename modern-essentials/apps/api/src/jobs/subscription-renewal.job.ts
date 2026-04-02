import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { Logger } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { SubscriptionService, SubscriptionStatus } from "../modules/subscription/subscription.service";

@Processor("subscription-renewal")
export class SubscriptionRenewalProcessor extends WorkerHost {
  private readonly logger = new Logger(SubscriptionRenewalProcessor.name);

  constructor(
    private prisma: PrismaService,
    private subscriptionService: SubscriptionService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing subscription renewal job ${job.id}`);

    const dueSubscriptions = await this.prisma.subscription.findMany({
      where: {
        status: SubscriptionStatus.ACTIVE,
        nextBillingAt: { lte: new Date() },
      },
    });

    this.logger.log(
      `Found ${dueSubscriptions.length} subscriptions due for renewal.`,
    );

    let processedCount = 0;
    for (const sub of dueSubscriptions) {
      try {
        await this.subscriptionService.transitionStatus(
          sub.id,
          SubscriptionStatus.RENEWAL_DUE,
          { jobName: "subscription-renewal", jobId: job.id }
        );
        processedCount++;
        this.logger.log(`Marked subscription ${sub.id} as RENEWAL_DUE.`);
      } catch (error: any) {
        this.logger.error(`Failed to transition subscription ${sub.id}: ${error.message}`);
      }
    }

    return { processed: processedCount };
  }
}

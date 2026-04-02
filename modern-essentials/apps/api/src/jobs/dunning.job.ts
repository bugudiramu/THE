import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { Logger } from "@nestjs/common";
import { SubscriptionService } from "../modules/subscription/subscription.service";

@Processor("dunning")
export class DunningProcessor extends WorkerHost {
  private readonly logger = new Logger(DunningProcessor.name);

  constructor(
    private subscriptionService: SubscriptionService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing dunning job ${job.id} of type ${job.name}`);

    const { subscriptionId, attempt } = job.data;

    try {
      if (job.name === "retry") {
        await this.subscriptionService.processDunningAttempt(subscriptionId, attempt);
      } else if (job.name === "auto-cancel") {
        await this.subscriptionService.autoCancel(subscriptionId);
      }

      return { processed: true };
    } catch (error: any) {
      this.logger.error(`Failed to process dunning job ${job.id}: ${error.message}`);
      throw error;
    }
  }
}

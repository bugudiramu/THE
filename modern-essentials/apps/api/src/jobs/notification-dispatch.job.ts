import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { Logger } from "@nestjs/common";

@Processor("notifications")
export class NotificationDispatchProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationDispatchProcessor.name);

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing notification job ${job.id} of type ${job.name}`);

    if (job.name === "email") {
      const { to, template, data } = job.data;
      // Mocked email dispatch (would call Resend API here in prod)
      this.logger.log(
        `[MOCK EMAIL] To: ${to} | Template: ${template} | Data: ${JSON.stringify(data)}`,
      );
    } else if (job.name === "whatsapp") {
      const { phone, template, data } = job.data;
      // Mocked WhatsApp dispatch (would call Interakt API here in prod)
      this.logger.log(
        `[MOCK WHATSAPP] Phone: ${phone} | Template: ${template} | Data: ${JSON.stringify(data)}`,
      );
    }

    return { delivered: true };
  }
}

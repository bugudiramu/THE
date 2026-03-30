import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { Inject, Logger } from "@nestjs/common";
import { EMAIL_ADAPTER, EmailAdapter } from "../modules/notifications/adapters/email.adapter.interface";
import { WHATSAPP_ADAPTER, WhatsAppAdapter } from "../modules/notifications/adapters/whatsapp.adapter.interface";

@Processor("notifications")
export class NotificationDispatchProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationDispatchProcessor.name);

  constructor(
    @Inject(EMAIL_ADAPTER) private readonly emailAdapter: EmailAdapter,
    @Inject(WHATSAPP_ADAPTER) private readonly whatsappAdapter: WhatsAppAdapter,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing notification job ${job.id} of type ${job.name}`);

    try {
      if (job.name === "email") {
        const { to, template, data } = job.data;
        // In a real implementation, we would use React Email to render the template
        const html = `<html><body>Template: ${template} | Data: ${JSON.stringify(data)}</body></html>`;
        await this.emailAdapter.sendEmail(to, `Modern Essentials: ${template}`, html);
      } else if (job.name === "whatsapp") {
        const { phone, template, data } = job.data;
        await this.whatsappAdapter.sendTemplate(phone, template, data);
      }

      return { delivered: true };
    } catch (error) {
      this.logger.error(`Failed to process notification job ${job.id}: ${(error as Error).message}`);
      throw error;
    }
  }
}


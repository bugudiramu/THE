import { Injectable, Logger } from "@nestjs/common";
import { WhatsAppAdapter } from "./whatsapp.adapter.interface";

@Injectable()
export class MockWhatsAppAdapter implements WhatsAppAdapter {
  private readonly logger = new Logger(MockWhatsAppAdapter.name);

  async sendTemplate(
    phone: string,
    templateName: string,
    params: Record<string, string>,
  ): Promise<boolean> {
    this.logger.log(
      `[MOCK WHATSAPP] Phone: ${phone} | Template: ${templateName} | Params: ${JSON.stringify(params)}`,
    );
    // In a real implementation, we would call Interakt API here.
    return true;
  }
}

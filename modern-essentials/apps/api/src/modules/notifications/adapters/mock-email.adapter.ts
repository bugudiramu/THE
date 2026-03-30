import { Injectable, Logger } from "@nestjs/common";
import { EmailAdapter } from "./email.adapter.interface";

@Injectable()
export class MockEmailAdapter implements EmailAdapter {
  private readonly logger = new Logger(MockEmailAdapter.name);

  async sendEmail(to: string, subject: string, _html: string): Promise<boolean> {
    this.logger.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
    // In a real implementation, we would call Resend API here.
    return true;
  }
}

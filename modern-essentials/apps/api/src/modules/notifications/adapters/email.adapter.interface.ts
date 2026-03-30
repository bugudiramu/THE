export interface EmailAdapter {
  sendEmail(to: string, subject: string, html: string): Promise<boolean>;
}

export const EMAIL_ADAPTER = "EMAIL_ADAPTER";

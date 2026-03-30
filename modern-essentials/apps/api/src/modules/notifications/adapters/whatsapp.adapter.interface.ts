export interface WhatsAppAdapter {
  sendTemplate(phone: string, templateName: string, params: Record<string, string>): Promise<boolean>;
}

export const WHATSAPP_ADAPTER = "WHATSAPP_ADAPTER";

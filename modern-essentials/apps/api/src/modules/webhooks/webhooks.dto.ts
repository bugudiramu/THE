export class RazorpayWebhookPayloadDto {
  event!: string;
  payload!: Record<string, unknown>;
  created_at!: number;
  [key: string]: unknown;
}

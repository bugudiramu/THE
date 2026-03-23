import { Body, Controller, Headers, Post } from "@nestjs/common";
import { WebhooksService } from "./webhooks.service";

@Controller("webhooks")
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post("razorpay")
  async handleRazorpayWebhook(
    @Body() payload: any,
    // @Headers("x-razorpay-signature") signature: string,
    @Headers("x-razorpay-event-id") eventId: string,
  ) {
    if (!eventId) {
      eventId = `fallback-${Date.now()}`;
    }

    // Assuming signature validation happens here in production via Razorpay SDK

    await this.webhooksService.handleRazorpayEvent(eventId, payload);
    return { status: "ok" };
  }
}

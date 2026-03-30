import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Post,
  RawBodyRequest,
  Req,
} from "@nestjs/common";
import { WebhooksService } from "./webhooks.service";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils";

@Controller("webhooks")
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post("razorpay")
  async handleRazorpayWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Body() payload: any,
    @Headers("x-razorpay-signature") signature: string,
    @Headers("x-razorpay-event-id") eventId: string,
  ) {
    if (!signature) {
      throw new BadRequestException("Missing Razorpay signature");
    }

    if (!req.rawBody) {
      throw new BadRequestException("Missing raw body for signature validation");
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      throw new BadRequestException("Razorpay webhook secret not configured");
    }

    // Validate signature
    const isValid = validateWebhookSignature(
      req.rawBody.toString(),
      signature,
      secret,
    );

    if (!isValid) {
      throw new BadRequestException("Invalid Razorpay signature");
    }

    if (!eventId) {
      eventId = `fallback-${Date.now()}`;
    }

    await this.webhooksService.handleRazorpayEvent(eventId, payload);
    return { status: "ok" };
  }
}

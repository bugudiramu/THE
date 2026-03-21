import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('razorpay')
  @HttpCode(HttpStatus.OK)
  async handleRazorpayWebhook(@Body() webhookData: any) {
    try {
      // Temporarily bypass signature verification for testing
      console.log('🔧 TESTING MODE: Bypassing signature verification');

      // Process webhook event without signature verification (for testing)
      await this.webhooksService.processWebhookEvent(webhookData);

      return {
        status: 'success',
        message: 'Webhook processed successfully (testing mode)',
      };
    } catch (error) {
      return { status: 'error', message: 'Webhook processing failed' };
    }
  }

  @Post('razorpay/test')
  @HttpCode(HttpStatus.OK)
  async handleRazorpayWebhookTest(@Body() webhookData: any) {
    try {
      // Process webhook event without signature verification (for testing)
      await this.webhooksService.processWebhookEvent(webhookData);

      return {
        status: 'success',
        message: 'Test webhook processed successfully',
      };
    } catch (error) {
      return { status: 'error', message: 'Test webhook processing failed' };
    }
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhooksService } from './webhooks.service';
import { WebhookController } from './webhook.controller';
import { Order } from '../entities/order.entity';
import { Subscription } from '../entities/subscription.entity';
import { RazorpayConfig } from '../config/razorpay.config';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Subscription])],
  providers: [WebhooksService, RazorpayConfig],
  controllers: [WebhookController],
})
export class WebhooksModule {}

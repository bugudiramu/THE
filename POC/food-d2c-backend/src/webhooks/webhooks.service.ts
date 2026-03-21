import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { RazorpayConfig } from '../config/razorpay.config';
import { Order, OrderStatus, PaymentStatus } from '../entities/order.entity';
import {
  Subscription,
  SubscriptionStatus,
} from '../entities/subscription.entity';

@Injectable()
export class WebhooksService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(Subscription)
    private subscriptionsRepository: Repository<Subscription>,
    private razorpayConfig: RazorpayConfig,
  ) {}

  verifyWebhookSignature(body: string, signature: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.razorpayConfig.keySecret)
        .update(body)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(signature),
      );
    } catch (error) {
      return false;
    }
  }

  async processWebhookEvent(webhookData: any) {
    console.log('Processing webhook event:', webhookData.event);
    const event = webhookData.event;
    const payload = webhookData.payload;

    try {
      switch (event) {
        case 'payment.captured':
          await this.handlePaymentCaptured(payload);
          break;
        case 'subscription.authenticated':
          await this.handleSubscriptionAuthenticated(payload);
          break;
        case 'subscription.activated':
          await this.handleSubscriptionActivated(payload);
          break;
        case 'subscription.charged':
          await this.handleSubscriptionCharged(payload);
          break;
        case 'subscription.completed':
          await this.handleSubscriptionCompleted(payload);
          break;
        case 'subscription.cancelled':
          await this.handleSubscriptionCancelled(payload);
          break;
        case 'subscription.paused':
          await this.handleSubscriptionPaused(payload);
          break;
        case 'subscription.resumed':
          await this.handleSubscriptionResumed(payload);
          break;
        default:
          console.log(`Unhandled webhook event: ${event}`);
      }
      console.log('Webhook event processed successfully');
    } catch (error) {
      console.error('Error processing webhook event:', error);
      throw error;
    }
  }

  private async handlePaymentCaptured(payload: any) {
    const { payment: paymentData, order: orderData } = payload.payment.entity;

    await this.ordersRepository.update(
      { razorpayOrderId: orderData.id },
      {
        paymentStatus: PaymentStatus.PAID,
        status: OrderStatus.CONFIRMED,
        razorpayPaymentId: paymentData.id,
      },
    );

    console.log(`Payment captured for order: ${orderData.id}`);
  }

  private async handleSubscriptionAuthenticated(payload: any) {
    const subscription = payload.subscription?.entity || payload.subscription;

    if (!subscription || !subscription.id) {
      console.error('Invalid subscription payload:', payload);
      return;
    }

    await this.subscriptionsRepository.update(
      { razorpaySubscriptionId: subscription.id },
      { status: SubscriptionStatus.ACTIVE },
    );

    console.log(`Subscription authenticated: ${subscription.id}`);
  }

  private async handleSubscriptionActivated(payload: any) {
    const subscription = payload.subscription?.entity || payload.subscription;

    if (!subscription || !subscription.id) {
      console.error('Invalid subscription payload:', payload);
      return;
    }

    await this.subscriptionsRepository.update(
      { razorpaySubscriptionId: subscription.id },
      {
        status: SubscriptionStatus.ACTIVE,
        nextBillingDate: new Date(subscription.charge_at * 1000),
      },
    );

    console.log(`Subscription activated: ${subscription.id}`);
  }

  private async handleSubscriptionCharged(payload: any) {
    const subscription = payload.subscription?.entity || payload.subscription;

    if (!subscription || !subscription.id) {
      console.error('Invalid subscription payload:', payload);
      return;
    }

    await this.subscriptionsRepository.update(
      { razorpaySubscriptionId: subscription.id },
      {
        nextBillingDate: new Date(subscription.charge_at * 1000),
        totalDeliveries: () => 'totalDeliveries + 1',
      },
    );

    const order = this.ordersRepository.create({
      razorpayOrderId: payload.payment.order_id,
      razorpayPaymentId: payload.payment.id,
      totalAmount: payload.payment.amount / 100,
      status: OrderStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
    });

    await this.ordersRepository.save(order);

    console.log(`Subscription charged: ${subscription.id}`);
  }

  private async handleSubscriptionCompleted(payload: any) {
    const subscription = payload.subscription?.entity || payload.subscription;

    if (!subscription || !subscription.id) {
      console.error('Invalid subscription payload:', payload);
      return;
    }

    await this.subscriptionsRepository.update(
      { razorpaySubscriptionId: subscription.id },
      { status: SubscriptionStatus.CANCELLED },
    );

    console.log(`Subscription completed: ${subscription.id}`);
  }

  private async handleSubscriptionCancelled(payload: any) {
    const subscription = payload.subscription?.entity || payload.subscription;

    if (!subscription || !subscription.id) {
      console.error('Invalid subscription payload:', payload);
      return;
    }

    await this.subscriptionsRepository.update(
      { razorpaySubscriptionId: subscription.id },
      { status: SubscriptionStatus.CANCELLED },
    );

    console.log(`Subscription cancelled: ${subscription.id}`);
  }

  private async handleSubscriptionPaused(payload: any) {
    const subscription = payload.subscription?.entity || payload.subscription;

    if (!subscription || !subscription.id) {
      console.error('Invalid subscription payload:', payload);
      return;
    }

    await this.subscriptionsRepository.update(
      { razorpaySubscriptionId: subscription.id },
      { status: SubscriptionStatus.PAUSED },
    );

    console.log(`Subscription paused: ${subscription.id}`);
  }

  private async handleSubscriptionResumed(payload: any) {
    const subscription = payload.subscription?.entity || payload.subscription;

    if (!subscription || !subscription.id) {
      console.error('Invalid subscription payload:', payload);
      return;
    }

    const updateData: any = {
      status: SubscriptionStatus.ACTIVE,
    };

    if (subscription.charge_at) {
      updateData.nextBillingDate = new Date(subscription.charge_at * 1000);
    }

    await this.subscriptionsRepository.update(
      { razorpaySubscriptionId: subscription.id },
      updateData,
    );

    console.log(`Subscription resumed: ${subscription.id}`);
  }
}

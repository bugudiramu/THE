import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Razorpay from 'razorpay';
import { Repository } from 'typeorm';
import { RazorpayConfig } from '../config/razorpay.config';
import { Order } from '../entities/order.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class PaymentsService {
  private razorpay: Razorpay;

  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private razorpayConfig: RazorpayConfig,
  ) {
    this.razorpay = new Razorpay({
      key_id: this.razorpayConfig.keyId,
      key_secret: this.razorpayConfig.keySecret,
    });
  }

  async createOrder(amount: number, currency: string = 'INR', userId: string) {
    try {
      const options = {
        amount: amount * 100, // Razorpay expects amount in paise
        currency,
        receipt: `receipt_${Date.now()}`,
        payment_capture: 1,
      };

      const razorpayOrder = await this.razorpay.orders.create(options);

      const order = this.ordersRepository.create({
        userId,
        totalAmount: amount,
        razorpayOrderId: razorpayOrder.id,
        status: 'pending' as any,
        paymentStatus: 'pending' as any,
      });

      await this.ordersRepository.save(order);

      return {
        orderId: order.id,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      };
    } catch (error) {
      throw new BadRequestException('Failed to create payment order');
    }
  }

  async verifyPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
  ) {
    try {
      const generatedSignature = (crypto as any)
        .createHmac('sha256', this.razorpayConfig.keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (generatedSignature !== razorpaySignature) {
        throw new BadRequestException('Invalid payment signature');
      }

      const order = await this.ordersRepository.findOne({
        where: { razorpayOrderId },
      });

      if (!order) {
        throw new BadRequestException('Order not found');
      }

      order.razorpayPaymentId = razorpayPaymentId;
      order.paymentStatus = 'paid' as any;
      order.status = 'confirmed' as any;

      await this.ordersRepository.save(order);

      return { success: true, orderId: order.id };
    } catch (error) {
      throw new BadRequestException('Payment verification failed');
    }
  }

  async createSubscriptionPlan(
    name: string,
    amount: number,
    interval: 'weekly' | 'monthly',
  ) {
    try {
      const period = interval === 'weekly' ? 'weekly' : 'monthly';

      const plan = await this.razorpay.plans.create({
        period,
        interval: 1,
        item: {
          name,
          description: `${name} subscription`,
          amount: amount * 100,
          currency: 'INR',
        },
      });

      return plan;
    } catch (error) {
      throw new BadRequestException('Failed to create subscription plan');
    }
  }

  async createSubscription(planId: string, customerId: string) {
    try {
      const subscription = await this.razorpay.subscriptions.create({
        plan_id: planId,
        customer_notify: 1,
        total_count: 12, // 12 billing cycles
      });

      return subscription;
    } catch (error) {
      throw new BadRequestException('Failed to create subscription');
    }
  }

  async cancelSubscription(subscriptionId: string) {
    try {
      const result = await this.razorpay.subscriptions.cancel(subscriptionId);
      return result;
    } catch (error) {
      throw new BadRequestException('Failed to cancel subscription');
    }
  }

  async pauseSubscription(subscriptionId: string) {
    try {
      const pausedSubscription =
        await this.razorpay.subscriptions.pause(subscriptionId);

      return pausedSubscription;
    } catch (error) {
      throw new BadRequestException('Failed to pause subscription');
    }
  }

  async resumeSubscription(subscriptionId: string) {
    try {
      const resumedSubscription =
        await this.razorpay.subscriptions.resume(subscriptionId);

      return resumedSubscription;
    } catch (error) {
      throw new BadRequestException('Failed to resume subscription');
    }
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Subscription,
  SubscriptionInterval,
  SubscriptionStatus,
} from '../entities/subscription.entity';
import { User } from '../entities/user.entity';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionsRepository: Repository<Subscription>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private paymentsService: PaymentsService,
  ) {}

  async createSubscription(
    userId: string,
    name: string,
    amount: number,
    interval: SubscriptionInterval,
    razorpayPlanId?: string,
  ) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let razorpaySubscriptionId: string | undefined;

    // Create Razorpay plan if not provided
    if (!razorpayPlanId) {
      const razorpayPlan = await this.paymentsService.createSubscriptionPlan(
        name,
        amount,
        interval,
      );
      razorpayPlanId = razorpayPlan.id;
    }

    // Create Razorpay subscription
    const razorpaySubscription = await this.paymentsService.createSubscription(
      razorpayPlanId,
      userId,
    );
    razorpaySubscriptionId = razorpaySubscription.id;

    const subscription = this.subscriptionsRepository.create({
      userId,
      name,
      interval,
      amount,
      razorpayPlanId,
      razorpaySubscriptionId,
      status: SubscriptionStatus.ACTIVE,
      nextBillingDate: this.calculateNextBillingDate(interval),
      totalDeliveries: 0,
    });

    return this.subscriptionsRepository.save(subscription);
  }

  async getUserSubscriptions(userId: string) {
    return this.subscriptionsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getSubscriptionById(id: string) {
    const subscription = await this.subscriptionsRepository.findOne({
      where: { id },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  async pauseSubscription(id: string) {
    const subscription = await this.getSubscriptionById(id);

    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new BadRequestException('Only active subscriptions can be paused');
    }

    if (subscription.razorpaySubscriptionId) {
      try {
        await this.paymentsService.pauseSubscription(
          subscription.razorpaySubscriptionId,
        );
      } catch (error) {
        console.error('Failed to pause subscription in Razorpay:', error);
        // Continue with local pause even if Razorpay fails
      }
    }

    subscription.status = SubscriptionStatus.PAUSED;
    return this.subscriptionsRepository.save(subscription);
  }

  async resumeSubscription(id: string) {
    const subscription = await this.getSubscriptionById(id);

    if (subscription.status !== SubscriptionStatus.PAUSED) {
      throw new BadRequestException('Only paused subscriptions can be resumed');
    }

    if (subscription.razorpaySubscriptionId) {
      try {
        await this.paymentsService.resumeSubscription(
          subscription.razorpaySubscriptionId,
        );
      } catch (error) {
        console.error('Failed to resume subscription in Razorpay:', error);
        // Continue with local resume even if Razorpay fails
      }
    }

    subscription.status = SubscriptionStatus.ACTIVE;
    return this.subscriptionsRepository.save(subscription);
  }

  async cancelSubscription(id: string) {
    const subscription = await this.getSubscriptionById(id);

    if (subscription.status === SubscriptionStatus.CANCELLED) {
      throw new BadRequestException('Subscription is already cancelled');
    }

    if (subscription.razorpaySubscriptionId) {
      try {
        await this.paymentsService.cancelSubscription(
          subscription.razorpaySubscriptionId,
        );
      } catch (error) {
        console.error('Failed to cancel subscription in Razorpay:', error);
        // Continue with local cancellation even if Razorpay fails
      }
    }

    subscription.status = SubscriptionStatus.CANCELLED;
    return this.subscriptionsRepository.save(subscription);
  }

  async updateSubscriptionBilling(id: string) {
    const subscription = await this.getSubscriptionById(id);

    if (subscription.status === SubscriptionStatus.ACTIVE) {
      subscription.totalDeliveries += 1;
      subscription.nextBillingDate = this.calculateNextBillingDate(
        subscription.interval,
      );
      await this.subscriptionsRepository.save(subscription);
    }

    return subscription;
  }

  private calculateNextBillingDate(interval: SubscriptionInterval): Date {
    const now = new Date();
    if (interval === SubscriptionInterval.WEEKLY) {
      now.setDate(now.getDate() + 7);
    } else if (interval === SubscriptionInterval.MONTHLY) {
      now.setMonth(now.getMonth() + 1);
    }
    return now;
  }

  async getAllSubscriptions() {
    return this.subscriptionsRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getSubscriptionStats() {
    const total = await this.subscriptionsRepository.count();
    const active = await this.subscriptionsRepository.count({
      where: { status: SubscriptionStatus.ACTIVE },
    });
    const paused = await this.subscriptionsRepository.count({
      where: { status: SubscriptionStatus.PAUSED },
    });
    const cancelled = await this.subscriptionsRepository.count({
      where: { status: SubscriptionStatus.CANCELLED },
    });

    return {
      total,
      active,
      paused,
      cancelled,
    };
  }
}

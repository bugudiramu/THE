import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { SubscriptionInterval } from '../../entities/subscription.entity';

export class CreateSubscriptionDto {
  @IsString()
  name: string;

  @IsNumber()
  amount: number;

  @IsEnum(SubscriptionInterval)
  interval: SubscriptionInterval;

  @IsString()
  @IsOptional()
  razorpayPlanId?: string;
}

import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { SubscriptionStatus } from '../../entities/subscription.entity';

export class UpdateSubscriptionDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsEnum(SubscriptionStatus)
  @IsOptional()
  status?: SubscriptionStatus;
}

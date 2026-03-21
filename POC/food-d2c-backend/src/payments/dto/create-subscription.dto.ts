import { IsString, IsNumber, IsEnum } from 'class-validator';

export class CreateSubscriptionDto {
  @IsString()
  name: string;

  @IsNumber()
  amount: number;

  @IsEnum(['weekly', 'monthly'])
  interval: 'weekly' | 'monthly';
}

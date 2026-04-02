import { IsString, IsInt, IsEnum, IsOptional, IsPositive } from 'class-validator';

export class CreateSubscriptionDto {
  @IsString()
  productId!: string;

  @IsInt()
  @IsPositive()
  quantity!: number;

  @IsEnum(['WEEKLY', 'FORTNIGHTLY', 'MONTHLY'])
  @IsOptional()
  frequency?: string;

  @IsString()
  @IsOptional()
  addressLine1?: string;

  @IsString()
  @IsOptional()
  addressLine2?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;
}

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  quantity?: number;

  @IsOptional()
  @IsEnum(['WEEKLY', 'FORTNIGHTLY', 'MONTHLY'])
  frequency?: string;
}

export class SubscriptionResponseDto {
  id!: string;
  productId!: string;
  productName!: string;
  quantity!: number;
  frequency!: string;
  status!: string;
  nextBillingAt!: Date;
  nextDeliveryAt!: Date;
  price!: number;
  savings!: number;
  razorpaySubscriptionId?: string;
  shortUrl?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  product!: {
    id: string;
    name: string;
    sku: string;
    price: number;
    subPrice?: number;
    category: string;
  };
}

export class SubscriptionListResponseDto {
  subscriptions!: SubscriptionResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
}

export class PauseSubscriptionDto {
  @IsInt()
  @IsPositive()
  @IsEnum([1, 2, 3, 4], { message: 'Pause duration must be between 1 and 4 weeks' })
  durationWeeks!: number;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class SkipDeliveryDto {
  @IsString()
  @IsOptional()
  reason?: string;
}

export class ChangeFrequencyDto {
  @IsEnum(['WEEKLY', 'FORTNIGHTLY', 'MONTHLY'])
  frequency!: string;
}

export class ChangeQuantityDto {
  @IsInt()
  @IsPositive()
  quantity!: number;
}

export class ChangeAddressDto {
  @IsString()
  addressLine1!: string;

  @IsString()
  @IsOptional()
  addressLine2?: string;

  @IsString()
  city!: string;

  @IsString()
  state!: string;

  @IsString()
  postalCode!: string;
}

export class SwapProductDto {
  @IsString()
  newProductId!: string;
}

export class CancelSubscriptionDto {
  @IsString()
  @IsEnum(['Too expensive', 'Quality issue', 'Too many eggs', 'Switching brand', 'Other'])
  reason!: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class AdminOverrideDto {
  @IsString()
  action!: 'PAUSE' | 'RESUME' | 'CANCEL' | 'MODIFY_QTY' | 'MODIFY_FREQ' | 'EXTEND';

  @IsOptional()
  @IsInt()
  @IsPositive()
  quantity?: number;

  @IsOptional()
  @IsEnum(['WEEKLY', 'FORTNIGHTLY', 'MONTHLY'])
  frequency?: string;

  @IsOptional()
  pauseUntil?: string;

  @IsString()
  reason!: string;
}

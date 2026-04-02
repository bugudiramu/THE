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
  price!: number;
  savings!: number;
  razorpaySubscriptionId?: string;
  shortUrl?: string;
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

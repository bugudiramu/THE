import { IsArray, IsInt, IsPositive, IsString, IsBoolean, IsOptional } from "class-validator";

export class CreateOrderDto {
  @IsString()
  name!: string;

  @IsString()
  phone!: string;

  @IsString()
  address!: string;

  @IsString()
  city!: string;

  @IsString()
  state!: string;

  @IsString()
  pincode!: string;

  @IsArray()
  items!: OrderItemDto[];
}

export class OrderItemDto {
  @IsString()
  productId!: string;

  @IsInt()
  @IsPositive()
  quantity!: number;

  @IsInt()
  @IsPositive()
  price!: number; // in paise

  @IsBoolean()
  @IsOptional()
  isSubscription?: boolean;

  @IsString()
  @IsOptional()
  frequency?: string; // e.g. 'WEEKLY', 'MONTHLY'
}

export class RazorpaySubscriptionResponseDto {
  subscriptionId!: string;
  amount!: number;
  currency!: string;
  key!: string;
  isHybrid!: boolean;
  upfrontAmount?: number;
}

export class RazorpayOrderResponseDto {
  razorpayOrderId!: string;
  amount!: number;
  currency!: string;
  key!: string;
  order!: {
    id: string;
    amount: number;
    currency: string;
  };
}

import { IsInt, IsPositive, IsString, IsBoolean, IsOptional, IsEnum } from "class-validator";
import { SubscriptionFrequency } from "@modern-essentials/db";

export class AddToCartDto {
  @IsString()
  productId!: string;

  @IsInt()
  @IsPositive()
  quantity!: number;

  @IsBoolean()
  @IsOptional()
  isSubscription?: boolean;

  @IsEnum(SubscriptionFrequency)
  @IsOptional()
  frequency?: SubscriptionFrequency;
}

export class UpdateCartItemDto {
  @IsInt()
  @IsPositive()
  quantity!: number;
}

export class CartItemResponseDto {
  id!: string;
  productId!: string;
  quantity!: number;
  priceSnapshot!: number; // in paise
  isSubscription!: boolean;
  frequency?: SubscriptionFrequency;
  createdAt!: Date;
  updatedAt!: Date;
  product!: {
    id: string;
    name: string;
    sku: string;
    price: number; // current price
    images: { url: string; alt?: string }[];
  };
}

export class CartResponseDto {
  id!: string;
  userId!: string;
  createdAt!: Date;
  updatedAt!: Date;
  items!: CartItemResponseDto[];
  totalItems!: number;
  totalAmount!: number; // in paise
}

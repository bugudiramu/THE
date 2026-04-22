import { IsInt, IsPositive, IsString, IsBoolean, IsOptional, IsEnum } from "class-validator";
import { SubscriptionFrequency } from "@modern-essentials/db";

export class AddToCartDto {
  @IsString()
  variantId!: string;

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
  variantId!: string;
  quantity!: number;
  priceSnapshot!: number; // in paise
  isSubscription!: boolean;
  frequency?: SubscriptionFrequency;
  createdAt!: Date;
  updatedAt!: Date;
  variant!: {
    id: string;
    sku: string;
    price: number;
    subPrice: number;
    packSize: number;
    product: {
      id: string;
      name: string;
      images: { url: string; alt?: string | null }[];
    };
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

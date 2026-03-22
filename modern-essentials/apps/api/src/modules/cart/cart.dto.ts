import { IsInt, IsPositive, IsString } from "class-validator";

export class AddToCartDto {
  @IsString()
  productId!: string;

  @IsInt()
  @IsPositive()
  quantity!: number;
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

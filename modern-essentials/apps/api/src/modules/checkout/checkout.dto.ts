import { IsArray, IsInt, IsPositive, IsString } from "class-validator";

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

import { IsString, IsOptional } from 'class-validator';

export class PaymentWebhookDto {
  @IsString()
  razorpay_order_id: string;

  @IsString()
  razorpay_payment_id: string;

  @IsString()
  razorpay_signature: string;

  @IsOptional()
  @IsString()
  error_code?: string;

  @IsOptional()
  @IsString()
  error_description?: string;
}

export class PaymentResponseDto {
  @IsString()
  razorpay_order_id: string;

  @IsString()
  razorpay_payment_id?: string;

  @IsString()
  razorpay_signature?: string;

  @IsOptional()
  @IsString()
  error?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

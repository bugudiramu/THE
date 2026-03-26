import { IsEnum, IsOptional, IsString } from "class-validator";

/**
 * Valid order status transitions for the ops team.
 * Follows the FSM: PAID → PICKED → PACKED → DISPATCHED → DELIVERED
 */
export enum OrderStatusAction {
  PICKED = "PICKED",
  PACKED = "PACKED",
  DISPATCHED = "DISPATCHED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatusAction)
  status!: OrderStatusAction;

  @IsOptional()
  @IsString()
  note?: string;
}

export class OrderFilterDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  date?: string; // ISO date string, defaults to today
}

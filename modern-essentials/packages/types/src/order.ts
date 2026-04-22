import { z } from 'zod';

// Enums
export const OrderStatusSchema = z.enum([
  'PENDING',
  'PAID',
  'PAYMENT_FAILED',
  'PICKED',
  'PACKED',
  'DISPATCHED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const OrderTypeSchema = z.enum(['ONE_TIME', 'SUBSCRIPTION_RENEWAL']);
export type OrderType = z.infer<typeof OrderTypeSchema>;

// Order item schema
export const OrderItemSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  variantId: z.string(),
  qty: z.number().int(),
  price: z.number().int(),
  total: z.number().int(),
});

export type OrderItem = z.infer<typeof OrderItemSchema>;

// Order schema
export const OrderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  subscriptionId: z.string().optional(),
  status: OrderStatusSchema,
  type: OrderTypeSchema,
  total: z.number().int(),
  placedAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
  items: z.array(OrderItemSchema).optional(),
});

export type Order = z.infer<typeof OrderSchema>;

// DTOs
export const CreateOrderItemSchema = z.object({
  variantId: z.string(),
  qty: z.number().int().min(1),
});

export type CreateOrderItemDto = z.infer<typeof CreateOrderItemSchema>;

export const CreateOrderSchema = z.object({
  userId: z.string(),
  items: z.array(CreateOrderItemSchema).min(1),
  type: OrderTypeSchema.default('ONE_TIME'),
});

export type CreateOrderDto = z.infer<typeof CreateOrderSchema>;

// Admin Dashboard Types

export interface OrderStatusCount {
  counts: Record<OrderStatus, number>;
  total: number;
}

export interface PickListItem {
  orderId: string;
  variantId: string;
  variantSku: string;
  productName: string;
  qtyNeeded: number;
  batchId: string;
  binLocation: string | null;
  expiresAt: string;
}

export interface ManifestItem {
  orderId: string;
  customerPhone: string;
  customerEmail: string | null;
  items: Array<{
    productName: string;
    sku: string;
    qty: number;
  }>;
  total: number;
  type: OrderType;
}

export const VALID_ORDER_TRANSITIONS: Record<string, OrderStatus[]> = {
  PAID: ["PICKED", "CANCELLED"],
  PICKED: ["PACKED", "CANCELLED"],
  PACKED: ["DISPATCHED", "CANCELLED"],
  DISPATCHED: ["DELIVERED"],
};

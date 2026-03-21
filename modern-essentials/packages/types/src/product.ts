import { z } from 'zod';

// Enums
export const CategorySchema = z.enum(['EGGS', 'DAIRY']);
export type Category = z.infer<typeof CategorySchema>;

export const BatchStatusSchema = z.enum(['AVAILABLE', 'RESERVED', 'DISPATCHED', 'WASTAGE']);
export type BatchStatus = z.infer<typeof BatchStatusSchema>;

export const QCStatusSchema = z.enum(['PENDING', 'PASS', 'QUARANTINE', 'REJECT']);
export type QCStatus = z.infer<typeof QCStatusSchema>;

// Product schema
export const ProductSchema = z.object({
  id: z.string(),
  sku: z.string(),
  name: z.string(),
  category: CategorySchema,
  price: z.number().int(),
  subPrice: z.number().int(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Product = z.infer<typeof ProductSchema>;

// Inventory batch schema
export const InventoryBatchSchema = z.object({
  id: z.string(),
  productId: z.string(),
  qty: z.number().int(),
  receivedAt: z.date(),
  expiresAt: z.date(),
  locationId: z.string().optional(),
  status: BatchStatusSchema,
  qcStatus: QCStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type InventoryBatch = z.infer<typeof InventoryBatchSchema>;

// DTOs
export const CreateProductSchema = z.object({
  sku: z.string(),
  name: z.string(),
  category: CategorySchema,
  price: z.number().int(),
  subPrice: z.number().int(),
});

export type CreateProductDto = z.infer<typeof CreateProductSchema>;

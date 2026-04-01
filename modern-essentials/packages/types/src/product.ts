import { z } from 'zod';

// Enums
export const CategorySchema = z.enum(['EGGS', 'DAIRY']);
export type Category = z.infer<typeof CategorySchema>;

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

// DTOs
export const CreateProductSchema = z.object({
  sku: z.string(),
  name: z.string(),
  category: CategorySchema,
  price: z.number().int(),
  subPrice: z.number().int(),
});

export type CreateProductDto = z.infer<typeof CreateProductSchema>;

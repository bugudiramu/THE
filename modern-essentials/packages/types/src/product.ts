import { z } from 'zod';

// Enums
export const CategorySchema = z.enum(['REGULAR_EGGS', 'BROWN_EGGS', 'HIGH_PROTEIN_EGGS']);
export type Category = z.infer<typeof CategorySchema>;

// Product variant schema
export const ProductVariantSchema = z.object({
  id: z.string(),
  productId: z.string(),
  sku: z.string(),
  packSize: z.number().int(),
  price: z.number().int(),
  subPrice: z.number().int(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ProductVariant = z.infer<typeof ProductVariantSchema>;

// Product schema
export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: CategorySchema,
  isActive: z.boolean(),
  description: z.string().nullable().optional(),
  seoTitle: z.string().nullable().optional(),
  seoDesc: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  variants: z.array(ProductVariantSchema).optional(),
});

export type Product = z.infer<typeof ProductSchema>;

// DTOs
export const CreateProductSchema = z.object({
  name: z.string(),
  category: CategorySchema,
  description: z.string().optional(),
});

export type CreateProductDto = z.infer<typeof CreateProductSchema>;

export const CreateProductVariantSchema = z.object({
  productId: z.string(),
  sku: z.string(),
  packSize: z.number().int(),
  price: z.number().int(),
  subPrice: z.number().int(),
});

export type CreateProductVariantDto = z.infer<typeof CreateProductVariantSchema>;

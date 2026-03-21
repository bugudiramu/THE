import { z } from 'zod';

// Enums
export const UserTierSchema = z.enum(['FREE', 'MEMBER']);
export type UserTier = z.infer<typeof UserTierSchema>;

// Base schemas
export const UserSchema = z.object({
  id: z.string(),
  phone: z.string(),
  email: z.string().email().optional(),
  clerkId: z.string(),
  tier: UserTierSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

// DTOs
export const CreateUserSchema = z.object({
  phone: z.string(),
  email: z.string().email().optional(),
  clerkId: z.string(),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;

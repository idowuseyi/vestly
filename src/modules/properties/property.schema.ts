import { z } from 'zod';

const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required').max(2, 'State must be 2 characters'),
  zip: z.string().min(5, 'ZIP code must be at least 5 characters'),
});

export const createPropertySchema = z.object({
  nickname: z.string().min(1, 'Nickname is required'),
  address: addressSchema,
});

export const updatePropertySchema = z.object({
  nickname: z.string().min(1).optional(),
  address: addressSchema.optional(),
});

export const propertyIdSchema = z.object({
  id: z.string().min(1, 'Property ID is required'),
});

export const propertyQuerySchema = z.object({
  city: z.string().optional(),
  state: z.string().optional(),
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type PropertyQuery = z.infer<typeof propertyQuerySchema>;

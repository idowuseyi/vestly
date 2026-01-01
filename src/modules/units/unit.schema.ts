import { z } from 'zod';

export const createUnitSchema = z.object({
  unitNumber: z.string().min(1, 'Unit number is required'),
  rent: z.number().min(0, 'Rent must be a positive number'),
});

export const updateUnitSchema = z.object({
  unitNumber: z.string().min(1).optional(),
  rent: z.number().min(0).optional(),
});

export const unitIdSchema = z.object({
  id: z.string().min(1, 'Unit ID is required'),
});

export const propertyIdParamSchema = z.object({
  id: z.string().min(1, 'Property ID is required'),
});

export type CreateUnitInput = z.infer<typeof createUnitSchema>;
export type UpdateUnitInput = z.infer<typeof updateUnitSchema>;

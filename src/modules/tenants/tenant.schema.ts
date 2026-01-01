import { z } from 'zod';

export const createTenantSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
});

export const tenantIdSchema = z.object({
  id: z.string().min(1, 'Tenant ID is required'),
});

export const unitIdParamSchema = z.object({
  id: z.string().min(1, 'Unit ID is required'),
});

export type CreateTenantInput = z.infer<typeof createTenantSchema>;

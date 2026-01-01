import { z } from 'zod';

export const earnCreditSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  memo: z.string().optional().default(''),
});

export const adjustCreditSchema = z.object({
  amount: z.number().refine((val) => val !== 0, {
    message: 'Adjustment amount cannot be zero',
  }),
  memo: z.string().min(1, 'Memo is required for adjustments'),
});

export const redeemCreditSchema = z.object({
  amount: z.number().positive('Redemption amount must be positive'),
  memo: z.string().optional().default(''),
});

export const ledgerQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
});

export const tenantIdParamSchema = z.object({
  id: z.string().min(1, 'Tenant ID is required'),
});

export type EarnCreditInput = z.infer<typeof earnCreditSchema>;
export type AdjustCreditInput = z.infer<typeof adjustCreditSchema>;
export type RedeemCreditInput = z.infer<typeof redeemCreditSchema>;
export type LedgerQuery = z.infer<typeof ledgerQuerySchema>;

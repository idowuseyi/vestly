import { Router } from 'express';
import { LedgerController } from './ledger.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireLandlordOrAdmin } from '../../middleware/roleGuard.middleware';
import { validateBody, validateParams, validateQuery } from '../../middleware/validate.middleware';
import {
  earnCreditSchema,
  adjustCreditSchema,
  redeemCreditSchema,
  ledgerQuerySchema,
  tenantIdParamSchema,
} from './ledger.schema';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Landlord/Admin only: Earn and Adjust credits
router.post(
  '/tenants/:id/credits/earn',
  requireLandlordOrAdmin,
  validateParams(tenantIdParamSchema),
  validateBody(earnCreditSchema),
  LedgerController.earn
);

router.post(
  '/tenants/:id/credits/adjust',
  requireLandlordOrAdmin,
  validateParams(tenantIdParamSchema),
  validateBody(adjustCreditSchema),
  LedgerController.adjust
);

// Redeem credits (any authenticated user, but ownership validated in service)
router.post(
  '/tenants/:id/credits/redeem',
  validateParams(tenantIdParamSchema),
  validateBody(redeemCreditSchema),
  LedgerController.redeem
);

// Get ledger history (ownership validated in service)
router.get(
  '/tenants/:id/credits/ledger',
  validateParams(tenantIdParamSchema),
  validateQuery(ledgerQuerySchema),
  LedgerController.getLedger
);

// Get balance (ownership validated in service)
router.get(
  '/tenants/:id/credits/balance',
  validateParams(tenantIdParamSchema),
  LedgerController.getBalance
);

export default router;

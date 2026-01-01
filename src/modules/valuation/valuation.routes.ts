import { Router } from 'express';
import { ValuationController } from './valuation.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireLandlordOrAdmin } from '../../middleware/roleGuard.middleware';
import { validateParams } from '../../middleware/validate.middleware';
import { z } from 'zod';

const propertyIdSchema = z.object({
  id: z.string().min(1, 'Property ID is required'),
});

const router = Router();

// All routes require authentication and landlord/admin role
router.use(authenticate);
router.use(requireLandlordOrAdmin);

router.post(
  '/properties/:id/valuation/snapshot',
  validateParams(propertyIdSchema),
  ValuationController.createSnapshot
);

router.get(
  '/properties/:id/valuation/snapshots',
  validateParams(propertyIdSchema),
  ValuationController.getSnapshots
);

export default router;

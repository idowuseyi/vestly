import { Router } from 'express';
import { UnitController } from './unit.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireLandlordOrAdmin } from '../../middleware/roleGuard.middleware';
import { validateBody, validateParams } from '../../middleware/validate.middleware';
import {
  updateUnitSchema,
  unitIdSchema,
} from './unit.schema';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Individual unit operations
router.get(
  '/:id',
  validateParams(unitIdSchema),
  UnitController.getById
);

router.put(
  '/:id',
  requireLandlordOrAdmin,
  validateParams(unitIdSchema),
  validateBody(updateUnitSchema),
  UnitController.update
);

router.delete(
  '/:id',
  requireLandlordOrAdmin,
  validateParams(unitIdSchema),
  UnitController.delete
);

export default router;

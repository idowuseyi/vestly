import { Router } from 'express';
import { UnitController } from './unit.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireLandlordOrAdmin } from '../../middleware/roleGuard.middleware';
import { validateBody, validateParams } from '../../middleware/validate.middleware';
import {
  createUnitSchema,
  updateUnitSchema,
  unitIdSchema,
  propertyIdParamSchema,
} from './unit.schema';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create unit for a property
router.post(
  '/properties/:id/units',
  requireLandlordOrAdmin,
  validateParams(propertyIdParamSchema),
  validateBody(createUnitSchema),
  UnitController.create
);

// Get units for a property
router.get(
  '/properties/:id/units',
  validateParams(propertyIdParamSchema),
  UnitController.getByProperty
);

// Individual unit operations
router.get(
  '/units/:id',
  validateParams(unitIdSchema),
  UnitController.getById
);

router.put(
  '/units/:id',
  requireLandlordOrAdmin,
  validateParams(unitIdSchema),
  validateBody(updateUnitSchema),
  UnitController.update
);

router.delete(
  '/units/:id',
  requireLandlordOrAdmin,
  validateParams(unitIdSchema),
  UnitController.delete
);

export default router;

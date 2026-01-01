import { Router } from 'express';
import { PropertyController } from './property.controller';
import { UnitController } from '../units/unit.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireLandlordOrAdmin } from '../../middleware/roleGuard.middleware';
import { validateBody, validateParams, validateQuery } from '../../middleware/validate.middleware';
import {
  createPropertySchema,
  updatePropertySchema,
  propertyIdSchema,
  propertyQuerySchema,
} from './property.schema';
import { createUnitSchema, propertyIdParamSchema } from '../units/unit.schema';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post(
  '/',
  requireLandlordOrAdmin,
  validateBody(createPropertySchema),
  PropertyController.create
);

router.get(
  '/',
  validateQuery(propertyQuerySchema),
  PropertyController.getAll
);

router.get(
  '/:id',
  validateParams(propertyIdSchema),
  PropertyController.getById
);

router.put(
  '/:id',
  requireLandlordOrAdmin,
  validateParams(propertyIdSchema),
  validateBody(updatePropertySchema),
  PropertyController.update
);

router.delete(
  '/:id',
  requireLandlordOrAdmin,
  validateParams(propertyIdSchema),
  PropertyController.delete
);

// Nested unit routes for properties
router.post(
  '/:id/units',
  requireLandlordOrAdmin,
  validateParams(propertyIdParamSchema),
  validateBody(createUnitSchema),
  UnitController.create
);

router.get(
  '/:id/units',
  validateParams(propertyIdParamSchema),
  UnitController.getByProperty
);

export default router;

import { Router } from 'express';
import { PropertyController } from './property.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireLandlordOrAdmin } from '../../middleware/roleGuard.middleware';
import { validateBody, validateParams, validateQuery } from '../../middleware/validate.middleware';
import {
  createPropertySchema,
  updatePropertySchema,
  propertyIdSchema,
  propertyQuerySchema,
} from './property.schema';

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

export default router;

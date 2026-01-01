import { Router } from 'express';
import { TenantController } from './tenant.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireTenant, requireLandlordOrAdmin } from '../../middleware/roleGuard.middleware';
import { validateBody, validateParams } from '../../middleware/validate.middleware';
import {
  createTenantSchema,
  tenantIdSchema,
  unitIdParamSchema,
} from './tenant.schema';

const router = Router();


// All routes require authentication
router.use(authenticate);

// Tenant-specific routes (must be before /tenants/:id)
router.get('/tenants/me', requireTenant, TenantController.getMe);

// Landlord/Admin routes (must be before /tenants/:id)
router.get('/tenants', requireLandlordOrAdmin, TenantController.getAll);

// Get tenant by ID (must be after /tenants and /tenants/me)
router.get(
  '/tenants/:id',
  validateParams(tenantIdSchema),
  TenantController.getById
);

// Create tenant for a unit
router.post(
  '/units/:id/tenants',
  requireLandlordOrAdmin,
  validateParams(unitIdParamSchema),
  validateBody(createTenantSchema),
  TenantController.create
);

export default router;

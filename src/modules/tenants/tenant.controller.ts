import { Response, NextFunction } from 'express';
import { TenantService } from './tenant.service';
import { CreateTenantInput } from './tenant.schema';
import { AuthenticatedRequest } from '../../shared/types';
import { ResponseUtil } from '../../shared/response.util';

export class TenantController {
  /**
   * @swagger
   * /api/v1/units/{id}/tenants:
   *   post:
   *     summary: Create a new tenant for a unit
   *     tags: [Tenants]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - userId
   *               - name
   *               - email
   *             properties:
   *               userId:
   *                 type: string
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *     responses:
   *       201:
   *         description: Tenant created successfully
   */
  static async create(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id: unitId } = req.params;
      const input = req.body as CreateTenantInput;
      const tenant = await TenantService.create(unitId, input, req);
      ResponseUtil.created(res, tenant, 'Tenant created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/tenants/me:
   *   get:
   *     summary: Get current tenant profile (tenant role only)
   *     tags: [Tenants]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Tenant profile retrieved successfully
   */
  static async getMe(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const tenant = await TenantService.getProfile(req);

      if (!tenant) {
        ResponseUtil.notFound(res, 'Tenant profile not found');
        return;
      }

      ResponseUtil.success(res, tenant, 'Tenant profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/tenants/{id}:
   *   get:
   *     summary: Get tenant by ID
   *     tags: [Tenants]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Tenant retrieved successfully
   */
  static async getById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const tenant = await TenantService.findById(id, req);

      if (!tenant) {
        ResponseUtil.notFound(res, 'Tenant not found');
        return;
      }

      ResponseUtil.success(res, tenant, 'Tenant retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/tenants:
   *   get:
   *     summary: Get all tenants
   *     tags: [Tenants]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Tenants retrieved successfully
   */
  static async getAll(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const tenants = await TenantService.findAll(req);
      ResponseUtil.success(res, tenants, 'Tenants retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

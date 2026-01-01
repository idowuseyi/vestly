import { Response, NextFunction } from 'express';
import { UnitService } from './unit.service';
import { CreateUnitInput, UpdateUnitInput } from './unit.schema';
import { AuthenticatedRequest } from '../../shared/types';
import { ResponseUtil } from '../../shared/response.util';

export class UnitController {
  /**
   * @swagger
   * /api/v1/properties/{id}/units:
   *   post:
   *     summary: Create a new unit for a property
   *     tags: [Units]
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
   *               - unitNumber
   *               - rent
   *             properties:
   *               unitNumber:
   *                 type: string
   *               rent:
   *                 type: number
   *     responses:
   *       201:
   *         description: Unit created successfully
   */
  static async create(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id: propertyId } = req.params;
      const input = req.body as CreateUnitInput;
      const unit = await UnitService.create(propertyId, input, req);
      ResponseUtil.created(res, unit, 'Unit created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/properties/{id}/units:
   *   get:
   *     summary: Get all units for a property
   *     tags: [Units]
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
   *         description: Units retrieved successfully
   */
  static async getByProperty(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id: propertyId } = req.params;
      const units = await UnitService.findByProperty(propertyId, req);
      ResponseUtil.success(res, units, 'Units retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/units/{id}:
   *   get:
   *     summary: Get unit by ID
   *     tags: [Units]
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
   *         description: Unit retrieved successfully
   */
  static async getById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const unit = await UnitService.findById(id, req);

      if (!unit) {
        ResponseUtil.notFound(res, 'Unit not found');
        return;
      }

      ResponseUtil.success(res, unit, 'Unit retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/units/{id}:
   *   put:
   *     summary: Update unit
   *     tags: [Units]
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
   *     responses:
   *       200:
   *         description: Unit updated successfully
   */
  static async update(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const input = req.body as UpdateUnitInput;
      const unit = await UnitService.update(id, input, req);

      if (!unit) {
        ResponseUtil.notFound(res, 'Unit not found');
        return;
      }

      ResponseUtil.success(res, unit, 'Unit updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/units/{id}:
   *   delete:
   *     summary: Delete unit
   *     tags: [Units]
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
   *         description: Unit deleted successfully
   */
  static async delete(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const unit = await UnitService.delete(id, req);

      if (!unit) {
        ResponseUtil.notFound(res, 'Unit not found');
        return;
      }

      ResponseUtil.success(res, unit, 'Unit deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

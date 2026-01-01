import { Response, NextFunction } from 'express';
import { PropertyService } from './property.service';
import { CreatePropertyInput, UpdatePropertyInput, PropertyQuery } from './property.schema';
import { AuthenticatedRequest } from '../../shared/types';
import { ResponseUtil } from '../../shared/response.util';

export class PropertyController {
  /**
   * @swagger
   * /api/v1/properties:
   *   post:
   *     summary: Create a new property
   *     tags: [Properties]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - nickname
   *               - address
   *             properties:
   *               nickname:
   *                 type: string
   *               address:
   *                 type: object
   *                 properties:
   *                   street:
   *                     type: string
   *                   city:
   *                     type: string
   *                   state:
   *                     type: string
   *                   zip:
   *                     type: string
   *     responses:
   *       201:
   *         description: Property created successfully
   */
  static async create(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const input = req.body as CreatePropertyInput;
      const property = await PropertyService.create(input, req);
      ResponseUtil.created(res, property, 'Property created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/properties:
   *   get:
   *     summary: Get all properties
   *     tags: [Properties]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: city
   *         schema:
   *           type: string
   *       - in: query
   *         name: state
   *         schema:
   *           type: string
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Properties retrieved successfully
   */
  static async getAll(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = req.query as unknown as PropertyQuery;
      const { properties, total } = await PropertyService.findAll(query, req);

      ResponseUtil.paginated(
        res,
        properties,
        query.page || 1,
        query.limit || 10,
        total,
        'Properties retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/properties/{id}:
   *   get:
   *     summary: Get property by ID
   *     tags: [Properties]
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
   *         description: Property retrieved successfully
   */
  static async getById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const property = await PropertyService.findById(id, req);

      if (!property) {
        ResponseUtil.notFound(res, 'Property not found');
        return;
      }

      ResponseUtil.success(res, property, 'Property retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/properties/{id}:
   *   put:
   *     summary: Update property
   *     tags: [Properties]
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
   *         description: Property updated successfully
   */
  static async update(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const input = req.body as UpdatePropertyInput;
      const property = await PropertyService.update(id, input, req);

      if (!property) {
        ResponseUtil.notFound(res, 'Property not found');
        return;
      }

      ResponseUtil.success(res, property, 'Property updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/properties/{id}:
   *   delete:
   *     summary: Delete property
   *     tags: [Properties]
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
   *         description: Property deleted successfully
   */
  static async delete(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const property = await PropertyService.delete(id, req);

      if (!property) {
        ResponseUtil.notFound(res, 'Property not found');
        return;
      }

      ResponseUtil.success(res, property, 'Property deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

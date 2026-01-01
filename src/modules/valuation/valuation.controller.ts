import { Response, NextFunction } from 'express';
import { valuationQueue } from './valuation.queue';
import { AuthenticatedRequest } from '../../shared/types';
import { ResponseUtil } from '../../shared/response.util';
import { Property } from '../properties/property.model';
import { applyOrgScope } from '../../shared/scoping.util';
import { ValuationSnapshot } from './valuation.model';

export class ValuationController {
  /**
   * @swagger
   * /api/v1/properties/{id}/valuation/snapshot:
   *   post:
   *     summary: Trigger property valuation snapshot job
   *     tags: [Valuation]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       202:
   *         description: Valuation job queued successfully
   */
  static async createSnapshot(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id: propertyId } = req.params;

      // Validate property exists and belongs to org
      const propertyQuery = applyOrgScope({ _id: propertyId }, req);
      const property = await Property.findOne(propertyQuery);

      if (!property) {
        ResponseUtil.notFound(res, 'Property not found');
        return;
      }

      // Queue the valuation job
      const job = await valuationQueue.add('valuation-snapshot', {
        propertyId,
        orgId: req.user.orgId,
      });

      ResponseUtil.success(
        res,
        {
          jobId: job.id,
          propertyId,
          status: 'queued',
        },
        'Valuation snapshot job queued successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/properties/{id}/valuation/snapshots:
   *   get:
   *     summary: Get valuation snapshots for a property
   *     tags: [Valuation]
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
   *         description: Snapshots retrieved successfully
   */
  static async getSnapshots(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id: propertyId } = req.params;

      const query = applyOrgScope({ propertyId }, req);
      const snapshots = await ValuationSnapshot.find(query)
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      ResponseUtil.success(res, snapshots, 'Snapshots retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

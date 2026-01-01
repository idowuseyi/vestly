import { Response, NextFunction } from 'express';
import { LedgerService } from './ledger.service';
import {
  EarnCreditInput,
  AdjustCreditInput,
  RedeemCreditInput,
  LedgerQuery,
} from './ledger.schema';
import { AuthenticatedRequest } from '../../shared/types';
import { ResponseUtil } from '../../shared/response.util';

export class LedgerController {
  /**
   * @swagger
   * /api/v1/tenants/{id}/credits/earn:
   *   post:
   *     summary: Add earned credits to tenant (landlord/admin only)
   *     tags: [Ledger]
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
   *               - amount
   *             properties:
   *               amount:
   *                 type: number
   *               memo:
   *                 type: string
   *     responses:
   *       201:
   *         description: Credits earned successfully
   */
  static async earn(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id: tenantId } = req.params;
      const input = req.body as EarnCreditInput;
      const transaction = await LedgerService.earn(tenantId, input, req);
      ResponseUtil.created(res, transaction, 'Credits earned successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/tenants/{id}/credits/adjust:
   *   post:
   *     summary: Adjust tenant credits (landlord/admin only)
   *     tags: [Ledger]
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
   *               - amount
   *               - memo
   *             properties:
   *               amount:
   *                 type: number
   *               memo:
   *                 type: string
   *     responses:
   *       201:
   *         description: Credits adjusted successfully
   */
  static async adjust(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id: tenantId } = req.params;
      const input = req.body as AdjustCreditInput;
      const transaction = await LedgerService.adjust(tenantId, input, req);
      ResponseUtil.created(res, transaction, 'Credits adjusted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/tenants/{id}/credits/redeem:
   *   post:
   *     summary: Redeem tenant credits (with balance validation)
   *     tags: [Ledger]
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
   *               - amount
   *             properties:
   *               amount:
   *                 type: number
   *               memo:
   *                 type: string
   *     responses:
   *       201:
   *         description: Credits redeemed successfully
   *       400:
   *         description: Insufficient balance
   */
  static async redeem(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id: tenantId } = req.params;
      const input = req.body as RedeemCreditInput;
      const transaction = await LedgerService.redeem(tenantId, input, req);
      ResponseUtil.created(res, transaction, 'Credits redeemed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/tenants/{id}/credits/ledger:
   *   get:
   *     summary: Get tenant ledger history (with pagination)
   *     tags: [Ledger]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
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
   *         description: Ledger retrieved successfully
   */
  static async getLedger(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id: tenantId } = req.params;
      const query = req.query as unknown as LedgerQuery;
      const { transactions, total } = await LedgerService.getLedger(tenantId, query, req);

      ResponseUtil.paginated(
        res,
        transactions,
        query.page || 1,
        query.limit || 10,
        total,
        'Ledger retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/tenants/{id}/credits/balance:
   *   get:
   *     summary: Get tenant credit balance
   *     tags: [Ledger]
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
   *         description: Balance retrieved successfully
   */
  static async getBalance(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id: tenantId } = req.params;
      const balance = await LedgerService.getBalance(tenantId, req);
      ResponseUtil.success(res, balance, 'Balance retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

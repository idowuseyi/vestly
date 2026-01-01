import {
  OwnershipCreditTransaction,
  IOwnershipCreditTransaction,
} from './ledger.model';
import { Tenant } from '../tenants/tenant.model';
import {
  EarnCreditInput,
  AdjustCreditInput,
  RedeemCreditInput,
  LedgerQuery,
} from './ledger.schema';
import { AuthenticatedRequest, TransactionType } from '../../shared/types';
import { applyOrgScope } from '../../shared/scoping.util';

export class LedgerService {
  /**
   * Calculate balance using MongoDB aggregation pipeline (high performance)
   */
  static async calculateBalanceAggregation(
    tenantId: string,
    req: AuthenticatedRequest
  ): Promise<number> {
    const query = applyOrgScope({ tenantId }, req);

    const result = await OwnershipCreditTransaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $cond: [
                { $eq: ['$type', TransactionType.REDEEM] },
                { $multiply: ['$amount', -1] }, // REDEEM is negative
                '$amount', // EARN and ADJUST are additive
              ],
            },
          },
        },
      },
    ]);

    return result.length > 0 ? result[0].total : 0;
  }

  /**
   * Calculate balance using TypeScript in-memory calculation
   */
  static async calculateBalanceInMemory(
    tenantId: string,
    req: AuthenticatedRequest
  ): Promise<number> {
    const query = applyOrgScope({ tenantId }, req);
    const transactions = await OwnershipCreditTransaction.find(query)
      .select('type amount')
      .lean();

    return transactions.reduce((balance, tx) => {
      if (tx.type === TransactionType.REDEEM) {
        return balance - tx.amount;
      }
      return balance + tx.amount;
    }, 0);
  }

  /**
   * Earn credits - Landlord/Admin only
   */
  static async earn(
    tenantId: string,
    input: EarnCreditInput,
    req: AuthenticatedRequest
  ): Promise<IOwnershipCreditTransaction> {
    // Validate tenant exists and belongs to org
    const tenantQuery = applyOrgScope({ _id: tenantId }, req);
    const tenant = await Tenant.findOne(tenantQuery);

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const transaction = await OwnershipCreditTransaction.create({
      orgId: req.user.orgId,
      tenantId,
      unitId: tenant.unitId,
      type: TransactionType.EARN,
      amount: input.amount,
      memo: input.memo || 'Credits earned',
    });

    return transaction;
  }

  /**
   * Adjust credits (can be positive or negative) - Landlord/Admin only
   */
  static async adjust(
    tenantId: string,
    input: AdjustCreditInput,
    req: AuthenticatedRequest
  ): Promise<IOwnershipCreditTransaction> {
    // Validate tenant exists and belongs to org
    const tenantQuery = applyOrgScope({ _id: tenantId }, req);
    const tenant = await Tenant.findOne(tenantQuery);

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const transaction = await OwnershipCreditTransaction.create({
      orgId: req.user.orgId,
      tenantId,
      unitId: tenant.unitId,
      type: TransactionType.ADJUST,
      amount: input.amount,
      memo: input.memo,
    });

    return transaction;
  }

  /**
   * Redeem credits - with balance validation
   */
  static async redeem(
    tenantId: string,
    input: RedeemCreditInput,
    req: AuthenticatedRequest
  ): Promise<IOwnershipCreditTransaction> {
    // Validate tenant exists and belongs to org
    const tenantQuery = applyOrgScope({ _id: tenantId }, req);
    const tenant = await Tenant.findOne(tenantQuery);

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // CRITICAL: Check balance before redemption
    const currentBalance = await this.calculateBalanceAggregation(tenantId, req);

    if (currentBalance < input.amount) {
      throw new Error(
        `Insufficient balance. Current balance: ${currentBalance}, Redemption amount: ${input.amount}`
      );
    }

    // Create redemption transaction
    const transaction = await OwnershipCreditTransaction.create({
      orgId: req.user.orgId,
      tenantId,
      unitId: tenant.unitId,
      type: TransactionType.REDEEM,
      amount: input.amount,
      memo: input.memo || 'Credits redeemed',
    });

    return transaction;
  }

  /**
   * Get ledger history with pagination - scoped by orgId
   * Tenants can only see their own ledger
   */
  static async getLedger(
    tenantId: string,
    query: LedgerQuery,
    req: AuthenticatedRequest
  ): Promise<{ transactions: IOwnershipCreditTransaction[]; total: number }> {
    // If user is a tenant, they can only see their own ledger
    if (req.user.role === 'tenant') {
      const tenantQuery = applyOrgScope({ userId: req.user.userId }, req);
      const tenant = await Tenant.findOne(tenantQuery);

      if (!tenant || tenant._id.toString() !== tenantId) {
        throw new Error('Access denied: Tenants can only view their own ledger');
      }
    }

    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const filter = applyOrgScope({ tenantId }, req);

    const [transactions, total] = await Promise.all([
      OwnershipCreditTransaction.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('tenantId', 'name email')
        .populate('unitId', 'unitNumber')
        .lean() as any,
      OwnershipCreditTransaction.countDocuments(filter),
    ]);

    return { transactions, total };
  }

  /**
   * Get current balance - uses aggregation for performance
   */
  static async getBalance(
    tenantId: string,
    req: AuthenticatedRequest
  ): Promise<{ tenantId: string; balance: number }> {
    // If user is a tenant, they can only see their own balance
    if (req.user.role === 'tenant') {
      const tenantQuery = applyOrgScope({ userId: req.user.userId }, req);
      const tenant = await Tenant.findOne(tenantQuery);

      if (!tenant || tenant._id.toString() !== tenantId) {
        throw new Error('Access denied: Tenants can only view their own balance');
      }
    }

    const balance = await this.calculateBalanceAggregation(tenantId, req);

    return { tenantId, balance };
  }
}

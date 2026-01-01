import { Worker, Job } from 'bullmq';
import { createRedisConnection } from '../../config/redis';
import { ValuationJobData } from './valuation.queue';
import { ValuationSnapshot } from './valuation.model';
import { Unit } from '../units/unit.model';
import { OwnershipCreditTransaction } from '../ledger/ledger.model';
import { TransactionType } from '../../shared/types';

const connection = createRedisConnection();

/**
 * Worker process for property valuation snapshots
 */
export const valuationWorker = new Worker<ValuationJobData>(
  'property-valuation',
  async (job: Job<ValuationJobData>) => {
    const { propertyId, orgId } = job.data;

    console.log(`Processing valuation for property ${propertyId} in org ${orgId}`);

    // Get all units for this property
    const units = await Unit.find({ propertyId, orgId }).lean();
    const unitCount = units.length;
    const totalRent = units.reduce((sum, unit) => sum + unit.rent, 0);

    // Get all tenants for these units
    const unitIds = units.map((unit) => unit._id);

    // Calculate total credits across all tenants in this property
    const creditAggregation = await OwnershipCreditTransaction.aggregate([
      {
        $match: {
          orgId,
          unitId: { $in: unitIds },
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $cond: [
                { $eq: ['$type', TransactionType.REDEEM] },
                { $multiply: ['$amount', -1] },
                '$amount',
              ],
            },
          },
        },
      },
    ]);

    const totalCredits = creditAggregation.length > 0 ? creditAggregation[0].total : 0;

    // Create snapshot
    const snapshot = await ValuationSnapshot.create({
      propertyId,
      orgId,
      unitCount,
      totalRent,
      totalCredits,
    });

    console.log(`✅ Valuation snapshot created: ${snapshot._id}`);

    return {
      snapshotId: snapshot._id,
      unitCount,
      totalRent,
      totalCredits,
    };
  },
  {
    connection,
    concurrency: 5, // Process up to 5 jobs concurrently
  }
);

valuationWorker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed successfully`);
});

valuationWorker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err);
});

console.log('✅ Valuation worker initialized');

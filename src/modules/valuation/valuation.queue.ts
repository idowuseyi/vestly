import { Queue } from 'bullmq';
import { createRedisConnection } from '../../config/redis';

export interface ValuationJobData {
  propertyId: string;
  orgId: string;
}

const connection = createRedisConnection();

export const valuationQueue = new Queue<ValuationJobData>('property-valuation', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      count: 100, // Keep last 100 completed jobs
    },
    removeOnFail: {
      count: 50, // Keep last 50 failed jobs
    },
  },
});

console.log('✅ Valuation queue initialized');

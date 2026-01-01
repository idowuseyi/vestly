import { connectDatabase } from './config/database';
import { valuationWorker } from './modules/valuation/valuation.worker';
import { config } from './config/env';

const startWorker = async (): Promise<void> => {
  try {
    // Connect to MongoDB (needed for worker operations)
    await connectDatabase();

    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                    VESTLY WORKER PROCESS                      ║
╠═══════════════════════════════════════════════════════════════╣
║  Environment: ${config.nodeEnv.padEnd(47)} ║
║  Worker:      Valuation Snapshot Processor${' '.repeat(19)} ║
║  Concurrency: 5 jobs${' '.repeat(38)} ║
╚═══════════════════════════════════════════════════════════════╝
    `);

    console.log('✅ Worker is ready to process jobs...');
  } catch (error) {
    console.error('❌ Failed to start worker:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async (): Promise<void> => {
  console.log('⚠️  Shutting down worker gracefully...');
  await valuationWorker.close();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

startWorker();

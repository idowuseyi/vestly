import Redis from 'ioredis';
import { config } from './env';

export const createRedisConnection = (): Redis => {
  const redis = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password || undefined,
    maxRetriesPerRequest: null, // Required for BullMQ
    enableReadyCheck: false,
  });

  redis.on('connect', () => {
    console.log('✅ Redis connected successfully');
  });

  redis.on('error', (err) => {
    console.error('❌ Redis connection error:', err);
  });

  return redis;
};

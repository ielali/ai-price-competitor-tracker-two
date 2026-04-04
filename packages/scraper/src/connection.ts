import { Redis } from "ioredis";

/** Shared BullMQ connection (duplicate per Queue/Worker as required by BullMQ). */
export function createRedisConnection(url: string): Redis {
  return new Redis(url, {
    maxRetriesPerRequest: null
  });
}

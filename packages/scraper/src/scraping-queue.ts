import { Queue, Worker, type JobsOptions, type Processor } from "bullmq";
import type { Redis } from "ioredis";
import type { ScrapeJobName, ScrapeJobPayload } from "./types.js";

export const SCRAPING_QUEUE_NAME = "scraping";

export type ScrapingQueue = Queue<ScrapeJobPayload, void, ScrapeJobName>;

export function createScrapingQueue(connection: Redis): ScrapingQueue {
  return new Queue<ScrapeJobPayload, void, ScrapeJobName>(SCRAPING_QUEUE_NAME, {
    connection
  });
}

export function createScrapingWorker(
  connection: Redis,
  processor: Processor<ScrapeJobPayload, void, ScrapeJobName>
): Worker<ScrapeJobPayload, void, ScrapeJobName> {
  return new Worker<ScrapeJobPayload, void, ScrapeJobName>(
    SCRAPING_QUEUE_NAME,
    processor,
    { connection, concurrency: 2 }
  );
}

export async function enqueueScrapeJob(
  queue: ScrapingQueue,
  payload: ScrapeJobPayload,
  options?: JobsOptions
): Promise<string | undefined> {
  const job = await queue.add("scrape-url", payload, options);
  return job.id;
}

/** Registers a repeatable sweep job; BullMQ deduplicates identical repeat configs in Redis. */
export async function registerPeriodicSweep(
  queue: Pick<ScrapingQueue, "add">,
  intervalMs: number,
  payload: ScrapeJobPayload
): Promise<void> {
  if (intervalMs < 1_000) {
    throw new Error("Sweep interval must be at least 1000ms");
  }
  const opts: JobsOptions = {
    repeat: { every: intervalMs }
  };
  await queue.add("scheduled-sweep", payload, opts);
}

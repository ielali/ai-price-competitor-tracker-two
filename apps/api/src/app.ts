import Fastify, { type FastifyInstance } from "fastify";
import {
  createRedisConnection,
  createScrapingQueue,
  createScrapingWorker,
  enqueueScrapeJob,
  registerPeriodicSweep,
  scrapeJobPayloadSchema,
  type ScrapingQueue
} from "@price-tracker/scraper";

const DEFAULT_REDIS_URL = "redis://127.0.0.1:6379";
const DEFAULT_SWEEP_MS = 300_000;

export type ApiAppOptions = {
  /**
   * When set, Redis is not opened and worker/scheduler are skipped.
   * Close handler will not call `queue.close()` (caller owns lifecycle).
   */
  scrapingQueue?: ScrapingQueue;
  redisUrl?: string;
  sweepIntervalMs?: number;
  /** When false, no Bull worker runs (useful for tests / enqueue-only API). */
  enableWorker?: boolean;
  /** When false, skip registering repeatable sweep job. */
  enableScheduler?: boolean;
  jobProcessor?: (payload: {
    sourceId: string;
    url?: string | undefined;
  }) => Promise<void>;
};

declare module "fastify" {
  interface FastifyInstance {
    scrapingQueue: ScrapingQueue;
  }
}

export async function buildApp(
  opts: ApiAppOptions = {}
): Promise<{ app: FastifyInstance; close: () => Promise<void> }> {
  const injected = opts.scrapingQueue != null;
  const redisUrl = opts.redisUrl ?? process.env.REDIS_URL ?? DEFAULT_REDIS_URL;
  const sweepIntervalMs =
    opts.sweepIntervalMs ??
    Number(process.env.SWEEP_INTERVAL_MS ?? DEFAULT_SWEEP_MS);

  let conn: ReturnType<typeof createRedisConnection> | null = null;
  let queueConn: ReturnType<typeof createRedisConnection> | null = null;
  let workerConn: ReturnType<typeof createRedisConnection> | null = null;
  let worker: ReturnType<typeof createScrapingWorker> | null = null;

  const queue =
    opts.scrapingQueue ??
    (() => {
      conn = createRedisConnection(redisUrl);
      queueConn = conn.duplicate();
      workerConn = conn.duplicate();
      return createScrapingQueue(queueConn);
    })();

  if (!injected) {
    const processor =
      opts.jobProcessor ??
      (async (payload) => {
        console.info("[scraper-worker] stub job", payload.sourceId, payload.url);
      });

    worker =
      opts.enableWorker === false
        ? null
        : createScrapingWorker(workerConn!, async (job) => {
            await processor(job.data);
          });

    if (opts.enableScheduler !== false) {
      await registerPeriodicSweep(queue, sweepIntervalMs, {
        sourceId: "scheduled-sweep"
      });
    }
  }

  const app = Fastify({ logger: false });
  app.decorate("scrapingQueue", queue);

  app.get("/health", async () => ({ ok: true as const }));

  app.post("/jobs/scrape", async (request, reply) => {
    const parsed = scrapeJobPayloadSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: "invalid_payload",
        details: parsed.error.flatten()
      });
    }
    const jobId = await enqueueScrapeJob(queue, parsed.data);
    return { jobId };
  });

  const close = async () => {
    await app.close();
    if (injected) return;
    if (worker) await worker.close();
    await queue.close();
    if (queueConn) await queueConn.quit();
    if (workerConn) await workerConn.quit();
    if (conn) await conn.quit();
  };

  return { app, close };
}

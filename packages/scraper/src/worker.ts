import { Worker } from 'bullmq';
import IORedis from 'ioredis';

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = Number(process.env.REDIS_PORT) || 6379;

const connection = new IORedis({
  host: redisHost,
  port: redisPort,
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  'scrape-jobs',
  async (job) => {
    console.log(`Processing scrape job ${job.id}:`, job.data);

    // Placeholder: actual scraping logic will be implemented in Epic 4
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log(`Scrape job ${job.id} completed (placeholder).`);
    return { status: 'completed', prices_collected: 0 };
  },
  {
    connection,
    concurrency: 3,
  },
);

worker.on('completed', (job) => {
  console.log(`Job ${job?.id} completed successfully.`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});

console.log(`Scraper worker started, connecting to Redis at ${redisHost}:${redisPort}`);
console.log('Waiting for scrape jobs on queue "scrape-jobs"...');

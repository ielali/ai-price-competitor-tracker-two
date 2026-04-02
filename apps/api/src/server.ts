import Fastify from 'fastify';
import pg from 'pg';

const { Pool } = pg;

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport:
      process.env.NODE_ENV !== 'production'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
  },
});

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'price_tracker',
  user: process.env.DB_USER || 'price_tracker',
  password: process.env.DB_PASSWORD || 'price_tracker',
});

fastify.get('/health', async () => {
  let dbStatus = 'disconnected';
  try {
    const result = await pool.query('SELECT 1');
    if (result.rows.length > 0) dbStatus = 'connected';
  } catch {
    dbStatus = 'error';
  }

  let redisStatus = 'not_checked';

  return {
    status: 'ok',
    service: 'api',
    timestamp: new Date().toISOString(),
    dependencies: {
      database: dbStatus,
      redis: redisStatus,
    },
  };
});

fastify.get('/', async () => {
  return { service: 'ai-competitor-price-tracker-api', version: '0.1.0' };
});

const start = async () => {
  try {
    const host = process.env.API_HOST || '0.0.0.0';
    const port = Number(process.env.API_PORT) || 4000;
    await fastify.listen({ host, port });
    fastify.log.info(`API server listening on ${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

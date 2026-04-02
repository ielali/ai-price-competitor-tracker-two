import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import { logger } from './utils/logger';
import authPlugin from './plugins/auth';
import tenantPlugin from './plugins/tenant';
import rateLimitPlugin from './plugins/rate-limit';
import authRoutes from './routes/auth';
import { AppError } from './utils/errors';

const app = Fastify({
  logger,
  trustProxy: true,
});

async function start() {
  await app.register(cors, {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  });

  await app.register(cookie);

  await app.register(rateLimitPlugin);
  await app.register(authPlugin);
  await app.register(tenantPlugin);

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      });
    }

    // Handle Fastify validation errors
    if (error.validation) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: error.validation,
        },
      });
    }

    app.log.error(error);
    return reply.status(500).send({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An internal server error occurred',
      },
    });
  });

  await app.register(authRoutes);

  const port = Number(process.env.PORT ?? 3001);
  const host = process.env.HOST ?? '0.0.0.0';

  await app.listen({ port, host });
}

start().catch((err) => {
  logger.error(err);
  process.exit(1);
});

import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import rateLimit from '@fastify/rate-limit';

const rateLimitPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(rateLimit, {
    global: false, // Apply per-route only
    redis: process.env.REDIS_URL
      ? await import('ioredis').then(({ default: Redis }) => new Redis(process.env.REDIS_URL!))
      : undefined,
    keyGenerator: (request) => {
      return request.ip;
    },
  });
};

export default fp(rateLimitPlugin, { name: 'rate-limit' });

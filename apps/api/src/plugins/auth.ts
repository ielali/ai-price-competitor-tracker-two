import fp from 'fastify-plugin';
import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { verifyAccessToken } from '../services/auth.service';
import { Errors } from '../utils/errors';

declare module 'fastify' {
  interface FastifyRequest {
    user: {
      userId: string;
      tenantId: string;
      role: string;
      email: string;
    };
  }
}

const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorateRequest('user', null);

  fastify.addHook('onRequest', async (request: FastifyRequest, reply) => {
    const { routeOptions } = request;

    // Skip auth for public routes
    if ((routeOptions.config as unknown as Record<string, unknown>)?.public === true) {
      return;
    }

    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      reply.status(401).send({
        error: { code: 'TOKEN_INVALID', message: 'Missing or invalid authorization header' },
      });
      return;
    }

    const token = authHeader.slice(7);
    try {
      const payload = await verifyAccessToken(token);
      request.user = payload;
    } catch {
      reply.status(401).send({
        error: { code: 'TOKEN_INVALID', message: 'Invalid or expired token' },
      });
    }
  });
};

export default fp(authPlugin, { name: 'auth' });

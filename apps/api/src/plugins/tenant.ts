import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import { pool } from '../db/client';

const tenantPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', async (request, _reply) => {
    const { routeOptions } = request;

    // Only set tenant context for authenticated requests
    if ((routeOptions.config as unknown as Record<string, unknown>)?.public === true) {
      return;
    }

    if (!request.user?.tenantId) {
      return;
    }

    // Acquire a client from the pool and set the tenant context for RLS
    const client = await pool.connect();
    try {
      await client.query(`SET app.current_tenant = '${request.user.tenantId}'`);
      // Store client reference for later cleanup
      (request as unknown as Record<string, unknown>)._pgClient = client;
    } catch (err) {
      client.release();
      throw err;
    }
  });

  fastify.addHook('onResponse', async (request) => {
    const client = (request as unknown as Record<string, unknown>)._pgClient as {
      release: () => void;
    } | undefined;
    if (client) {
      client.release();
    }
  });
};

export default fp(tenantPlugin, { name: 'tenant', dependencies: ['auth'] });

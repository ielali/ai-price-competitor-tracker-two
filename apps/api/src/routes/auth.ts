import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { loginSchema, registerSchema } from '@price-tracker/shared';
import { register, login, refreshAccessToken, logout } from '../services/auth.service';

const REFRESH_COOKIE_NAME = 'refresh_token';
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    '/api/auth/register',
    { config: { public: true, rateLimit: { max: 10, timeWindow: '15 minutes' } } },
    async (request, reply) => {
      const result = registerSchema.safeParse(request.body);
      if (!result.success) {
        return reply.status(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: result.error.flatten().fieldErrors,
          },
        });
      }

      const data = await register(result.data);
      return reply.status(201).send({ data });
    }
  );

  fastify.post(
    '/api/auth/login',
    {
      config: {
        public: true,
        rateLimit: {
          max: 5,
          timeWindow: '15 minutes',
          ban: 2,
          keyGenerator: (request: FastifyRequest) => `login:${request.ip}`,
          errorResponseBuilder: (_request: FastifyRequest, context: { ttl: number }) => ({
            error: {
              code: 'RATE_LIMITED',
              message: 'Too many failed login attempts. Please try again later.',
              details: { retryAfter: context.ttl / 1000 },
            },
          }),
          addHeadersOnExceeding: {
            'x-ratelimit-limit': true,
            'x-ratelimit-remaining': true,
            'x-ratelimit-reset': true,
          },
          addHeaders: {
            'retry-after': true,
          },
        },
      },
    },
    async (request, reply) => {
      const result = loginSchema.safeParse(request.body);
      if (!result.success) {
        return reply.status(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: result.error.flatten().fieldErrors,
          },
        });
      }

      const { refreshToken, ...authData } = await login(result.data);

      reply.setCookie(REFRESH_COOKIE_NAME, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: REFRESH_TOKEN_MAX_AGE,
        path: '/api/auth',
      });

      return reply.status(200).send({ data: authData });
    }
  );

  fastify.post(
    '/api/auth/refresh',
    { config: { public: true } },
    async (request, reply) => {
      const refreshToken = request.cookies[REFRESH_COOKIE_NAME];
      if (!refreshToken) {
        return reply.status(401).send({
          error: { code: 'TOKEN_INVALID', message: 'No refresh token provided' },
        });
      }

      const data = await refreshAccessToken(refreshToken);
      return reply.status(200).send({ data });
    }
  );

  fastify.post(
    '/api/auth/logout',
    { config: { public: true } },
    async (request, reply) => {
      const refreshToken = request.cookies[REFRESH_COOKIE_NAME];
      if (refreshToken) {
        await logout(refreshToken);
      }

      reply.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
      return reply.status(200).send({ data: { message: 'Logged out successfully' } });
    }
  );
};

export default authRoutes;

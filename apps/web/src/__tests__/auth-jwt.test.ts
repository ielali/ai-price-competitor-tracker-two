// @vitest-environment node
import { describe, expect, it, beforeEach } from 'vitest';
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '@/lib/auth/jwt';
import { __resetJwtSecretCacheForTests } from '@/lib/auth/secret';

const samplePayload = {
  sub: 'user-1',
  email: 'u@example.com',
  name: 'User',
  roles: ['member'] as const,
};

describe('JWT helpers', () => {
  beforeEach(() => {
    __resetJwtSecretCacheForTests();
    process.env.AUTH_SECRET = 'unit-test-auth-secret-32characters!';
  });

  it('round-trips access tokens', async () => {
    const token = await signAccessToken(samplePayload);
    const { payload } = await verifyAccessToken(token);
    expect(payload.sub).toBe('user-1');
    expect(payload.email).toBe('u@example.com');
  });

  it('rejects refresh tokens as access', async () => {
    const token = await signRefreshToken(samplePayload);
    await expect(verifyAccessToken(token)).rejects.toThrow();
  });

  it('round-trips refresh tokens', async () => {
    const token = await signRefreshToken(samplePayload);
    const { payload } = await verifyRefreshToken(token);
    expect(payload.sub).toBe('user-1');
  });
});

import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import {
  __resetUserStoreForTests,
  ensureDemoUserSeeded,
  findUserByEmail,
} from '@/lib/auth/user-store';
import { verifyPassword } from '@/lib/auth/password';

describe('ensureDemoUserSeeded', () => {
  const prev = { ...process.env };

  beforeEach(() => {
    __resetUserStoreForTests();
  });

  afterEach(() => {
    process.env = { ...prev };
  });

  it('creates demo user from DEMO_USER_* env', async () => {
    process.env.DEMO_USER_EMAIL = 'demo@example.com';
    process.env.DEMO_USER_PASSWORD = 'secret-password';
    await ensureDemoUserSeeded();
    const u = findUserByEmail('demo@example.com');
    expect(u).toBeDefined();
    expect(await verifyPassword('secret-password', u!.passwordHash)).toBe(true);
  });

  it('supports legacy AUTH_DEMO_* aliases', async () => {
    process.env.AUTH_DEMO_USER_EMAIL = 'legacy@example.com';
    process.env.AUTH_DEMO_PASSWORD = 'legacy-pass';
    await ensureDemoUserSeeded();
    expect(findUserByEmail('legacy@example.com')).toBeDefined();
  });

  it('no-ops when env is unset', async () => {
    delete process.env.DEMO_USER_EMAIL;
    delete process.env.DEMO_USER_PASSWORD;
    delete process.env.AUTH_DEMO_USER_EMAIL;
    delete process.env.AUTH_DEMO_PASSWORD;
    await ensureDemoUserSeeded();
    expect(findUserByEmail('demo@example.com')).toBeUndefined();
  });
});

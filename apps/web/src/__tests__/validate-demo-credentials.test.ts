import { afterEach, describe, expect, it, vi } from 'vitest';

describe('validateDemoCredentials', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  it('returns true when email and password match env', async () => {
    process.env.DEMO_USER_EMAIL = 'user@example.com';
    process.env.DEMO_USER_PASSWORD = 'secret-pass';
    const { validateDemoCredentials } = await import(
      '@/lib/validate-demo-credentials'
    );
    expect(validateDemoCredentials('user@example.com', 'secret-pass')).toBe(
      true
    );
  });

  it('returns false on wrong password', async () => {
    process.env.DEMO_USER_EMAIL = 'user@example.com';
    process.env.DEMO_USER_PASSWORD = 'secret-pass';
    const { validateDemoCredentials } = await import(
      '@/lib/validate-demo-credentials'
    );
    expect(validateDemoCredentials('user@example.com', 'wrong')).toBe(false);
  });

  it('returns false when DEMO_USER_EMAIL is missing', async () => {
    delete process.env.DEMO_USER_EMAIL;
    process.env.DEMO_USER_PASSWORD = 'x';
    const { validateDemoCredentials } = await import(
      '@/lib/validate-demo-credentials'
    );
    expect(validateDemoCredentials('a@b.com', 'x')).toBe(false);
  });

  it('returns false when DEMO_USER_PASSWORD is missing', async () => {
    process.env.DEMO_USER_EMAIL = 'a@b.com';
    delete process.env.DEMO_USER_PASSWORD;
    const { validateDemoCredentials } = await import(
      '@/lib/validate-demo-credentials'
    );
    expect(validateDemoCredentials('a@b.com', 'x')).toBe(false);
  });
});

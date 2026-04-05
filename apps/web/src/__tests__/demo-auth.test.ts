import { afterEach, describe, expect, it, vi } from 'vitest';
import { validateDemoCredentials } from '@/lib/demo-auth';

describe('validateDemoCredentials', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('accepts default demo user when env is unset', () => {
    delete process.env.AUTH_DEMO_EMAIL;
    delete process.env.AUTH_DEMO_PASSWORD;
    expect(validateDemoCredentials('demo@example.com', 'demo-password')).toBe(true);
  });

  it('rejects wrong password', () => {
    delete process.env.AUTH_DEMO_EMAIL;
    delete process.env.AUTH_DEMO_PASSWORD;
    expect(validateDemoCredentials('demo@example.com', 'wrong')).toBe(false);
  });

  it('respects custom env credentials', () => {
    vi.stubEnv('AUTH_DEMO_EMAIL', 'admin@test.dev');
    vi.stubEnv('AUTH_DEMO_PASSWORD', 'secret1');
    expect(validateDemoCredentials('admin@test.dev', 'secret1')).toBe(true);
    expect(validateDemoCredentials('admin@test.dev', 'nope')).toBe(false);
  });

  it('matches email case-insensitively', () => {
    delete process.env.AUTH_DEMO_EMAIL;
    delete process.env.AUTH_DEMO_PASSWORD;
    expect(validateDemoCredentials('Demo@Example.com', 'demo-password')).toBe(true);
  });
});

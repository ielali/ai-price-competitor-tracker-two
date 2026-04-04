import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getExpectedDemoCredentials,
  validateDemoCredentials,
} from '@/lib/validate-demo-credentials';

describe('validateDemoCredentials', () => {
  const keys = [
    'DEMO_USER_EMAIL',
    'DEMO_USER_PASSWORD',
    'AUTH_DEMO_EMAIL',
    'AUTH_DEMO_PASSWORD',
  ] as const;

  beforeEach(() => {
    for (const k of keys) {
      delete process.env[k];
    }
  });

  afterEach(() => {
    for (const k of keys) {
      delete process.env[k];
    }
  });

  it('accepts built-in demo defaults when env overrides are unset', () => {
    expect(getExpectedDemoCredentials()).toEqual({
      email: 'demo@example.com',
      password: 'demo',
    });
    expect(validateDemoCredentials('demo@example.com', 'demo')).toBe(true);
    expect(validateDemoCredentials('demo@example.com', 'wrong')).toBe(false);
  });

  it('honors DEMO_USER_EMAIL and DEMO_USER_PASSWORD', () => {
    process.env.DEMO_USER_EMAIL = 'custom@example.com';
    process.env.DEMO_USER_PASSWORD = 's3cret';

    expect(validateDemoCredentials('custom@example.com', 's3cret')).toBe(true);
    expect(validateDemoCredentials('custom@example.com', 'no')).toBe(false);
  });

  it('falls back to AUTH_DEMO_* when DEMO_USER_* are unset', () => {
    process.env.AUTH_DEMO_EMAIL = 'legacy@example.com';
    process.env.AUTH_DEMO_PASSWORD = 'legacy';

    expect(validateDemoCredentials('legacy@example.com', 'legacy')).toBe(true);
    expect(validateDemoCredentials('demo@example.com', 'demo')).toBe(false);
  });
});

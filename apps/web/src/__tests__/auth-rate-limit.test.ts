import { describe, expect, it, beforeEach } from 'vitest';
import { checkRateLimit, __resetRateLimitsForTests } from '@/lib/auth/rate-limit';

describe('checkRateLimit', () => {
  beforeEach(() => {
    __resetRateLimitsForTests();
  });

  it('allows bursts under the cap', () => {
    const key = 'ip:test';
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(key, 10, 60_000).ok).toBe(true);
    }
  });

  it('blocks after the cap within the window', () => {
    const key = 'ip:block';
    for (let i = 0; i < 3; i++) {
      checkRateLimit(key, 3, 60_000);
    }
    const last = checkRateLimit(key, 3, 60_000);
    expect(last.ok).toBe(false);
    if (!last.ok) {
      expect(last.retryAfterSec).toBeGreaterThan(0);
    }
  });
});

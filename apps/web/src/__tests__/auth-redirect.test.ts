import { describe, expect, it } from 'vitest';
import { authCallbackDestination, safeInternalPath } from '@/lib/auth/redirect';

describe('safeInternalPath', () => {
  it('allows simple relative paths', () => {
    expect(safeInternalPath('/products')).toBe('/products');
  });

  it('rejects protocol and scheme attempts', () => {
    expect(safeInternalPath('https://evil.com')).toBe('/');
    expect(safeInternalPath('//evil.com')).toBe('/');
  });

  it('defaults empty to home', () => {
    expect(safeInternalPath(null)).toBe('/');
  });
});

describe('authCallbackDestination', () => {
  it('prefers callbackUrl over from', () => {
    const sp = new URLSearchParams({
      callbackUrl: '/reports',
      from: '/products',
    });
    expect(authCallbackDestination(sp)).toBe('/reports');
  });

  it('falls back to from', () => {
    const sp = new URLSearchParams({ from: '/alerts' });
    expect(authCallbackDestination(sp)).toBe('/alerts');
  });
});

import { describe, expect, it } from 'vitest';
import { validateDemoCredentials } from '@/lib/demo-auth';

describe('validateDemoCredentials', () => {
  it('returns user when email and password match env pair', () => {
    expect(
      validateDemoCredentials('a@b.com', 'secret', 'a@b.com', 'secret'),
    ).toEqual({
      id: 'demo-user',
      email: 'a@b.com',
      name: 'Demo User',
    });
  });

  it('returns null when email mismatches', () => {
    expect(validateDemoCredentials('x@b.com', 'secret', 'a@b.com', 'secret')).toBeNull();
  });

  it('returns null when password mismatches', () => {
    expect(validateDemoCredentials('a@b.com', 'wrong', 'a@b.com', 'secret')).toBeNull();
  });

  it('returns null when any input is missing', () => {
    expect(validateDemoCredentials(undefined, 'x', 'a', 'b')).toBeNull();
    expect(validateDemoCredentials('a', undefined, 'a', 'b')).toBeNull();
    expect(validateDemoCredentials('a', 'b', undefined, 'b')).toBeNull();
    expect(validateDemoCredentials('a', 'b', 'a', undefined)).toBeNull();
  });
});

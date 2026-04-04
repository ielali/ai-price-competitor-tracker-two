import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema } from '@/lib/auth/validation';

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const r = loginSchema.safeParse({ email: 'a@b.co', password: 'x' });
    expect(r.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const r = loginSchema.safeParse({ email: 'n', password: 'x' });
    expect(r.success).toBe(false);
  });
});

describe('registerSchema', () => {
  it('requires matching passwords', () => {
    const r = registerSchema.safeParse({
      name: 'Ada',
      email: 'ada@example.com',
      password: 'password1',
      confirmPassword: 'password2',
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.flatten().fieldErrors.confirmPassword?.length).toBeGreaterThan(0);
    }
  });

  it('accepts matching passwords', () => {
    const r = registerSchema.safeParse({
      name: 'Ada',
      email: 'ada@example.com',
      password: 'password1',
      confirmPassword: 'password1',
    });
    expect(r.success).toBe(true);
  });
});

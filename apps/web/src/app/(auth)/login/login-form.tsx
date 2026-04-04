'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authCallbackDestination } from '@/lib/auth/redirect';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    form?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        fields?: Record<string, string[] | undefined>;
      };
      if (!res.ok) {
        if (data.fields) {
          setErrors({
            email: data.fields.email?.[0],
            password: data.fields.password?.[0],
            form: typeof data.error === 'string' ? data.error : undefined,
          });
        } else {
          setErrors({
            form: typeof data.error === 'string' ? data.error : 'Sign in failed',
          });
        }
        return;
      }
      const dest = authCallbackDestination(searchParams);
      router.push(dest);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        New here?{' '}
        <Link href="/register" className="text-primary underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
      <form className="mt-8 space-y-4" onSubmit={onSubmit} noValidate>
        {errors.form ? (
          <p id="login-form-error" role="alert" className="text-sm text-destructive">
            {errors.form}
          </p>
        ) : null}
        <div className="space-y-2">
          <label htmlFor="login-email" className="text-sm font-medium leading-none">
            Email
          </label>
          <Input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={
              errors.email ? 'login-email-error' : errors.form ? 'login-form-error' : undefined
            }
            required
          />
          {errors.email ? (
            <p id="login-email-error" className="text-sm text-destructive">
              {errors.email}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <label htmlFor="login-password" className="text-sm font-medium leading-none">
            Password
          </label>
          <Input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={
              errors.password
                ? 'login-password-error'
                : errors.form
                  ? 'login-form-error'
                  : undefined
            }
            required
          />
          {errors.password ? (
            <p id="login-password-error" className="text-sm text-destructive">
              {errors.password}
            </p>
          ) : null}
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </>
  );
}

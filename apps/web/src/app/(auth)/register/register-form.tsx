'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    form?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        fields?: Record<string, string[] | undefined>;
      };
      if (!res.ok) {
        if (data.fields) {
          setErrors({
            name: data.fields.name?.[0],
            email: data.fields.email?.[0],
            password: data.fields.password?.[0],
            confirmPassword: data.fields.confirmPassword?.[0],
            form: typeof data.error === 'string' ? data.error : undefined,
          });
        } else {
          setErrors({
            form: typeof data.error === 'string' ? data.error : 'Registration failed',
          });
        }
        return;
      }
      router.push('/');
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Already registered?{' '}
        <Link href="/login" className="text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
      <form className="mt-8 space-y-4" onSubmit={onSubmit} noValidate>
        {errors.form ? (
          <p id="register-form-error" role="alert" className="text-sm text-destructive">
            {errors.form}
          </p>
        ) : null}
        <div className="space-y-2">
          <label htmlFor="register-name" className="text-sm font-medium leading-none">
            Name
          </label>
          <Input
            id="register-name"
            name="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={
              errors.name ? 'register-name-error' : errors.form ? 'register-form-error' : undefined
            }
            required
          />
          {errors.name ? (
            <p id="register-name-error" className="text-sm text-destructive">
              {errors.name}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <label htmlFor="register-email" className="text-sm font-medium leading-none">
            Email
          </label>
          <Input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={
              errors.email
                ? 'register-email-error'
                : errors.form
                  ? 'register-form-error'
                  : undefined
            }
            required
          />
          {errors.email ? (
            <p id="register-email-error" className="text-sm text-destructive">
              {errors.email}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <label htmlFor="register-password" className="text-sm font-medium leading-none">
            Password
          </label>
          <Input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={
              errors.password
                ? 'register-password-error'
                : errors.form
                  ? 'register-form-error'
                  : undefined
            }
            required
          />
          {errors.password ? (
            <p id="register-password-error" className="text-sm text-destructive">
              {errors.password}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <label htmlFor="register-confirm" className="text-sm font-medium leading-none">
            Confirm password
          </label>
          <Input
            id="register-confirm"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            aria-invalid={errors.confirmPassword ? true : undefined}
            aria-describedby={
              errors.confirmPassword
                ? 'register-confirm-error'
                : errors.form
                  ? 'register-form-error'
                  : undefined
            }
            required
          />
          {errors.confirmPassword ? (
            <p id="register-confirm-error" className="text-sm text-destructive">
              {errors.confirmPassword}
            </p>
          ) : null}
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </>
  );
}

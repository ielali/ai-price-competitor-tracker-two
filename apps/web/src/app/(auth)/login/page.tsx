import { Suspense } from 'react';
import { LoginForm } from './login-form';

function LoginFallback() {
  return (
    <div
      className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-sm"
      aria-busy="true"
    >
      <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}

import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/login-form';

export const metadata = {
  title: 'Sign in — AI Competitor Price Tracker',
};

function LoginFormFallback() {
  return (
    <p className="text-muted-foreground text-sm" aria-live="polite">
      Loading…
    </p>
  );
}

export default function LoginPage() {
  return (
    <div className="bg-background w-full max-w-md rounded-lg border p-8 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Use your workspace credentials to continue.
      </p>
      <div className="mt-8">
        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}

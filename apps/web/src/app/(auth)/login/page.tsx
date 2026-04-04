import { Suspense } from 'react';
import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center p-6">
      <div className="border-border bg-card w-full max-w-sm rounded-lg border p-8 shadow-sm">
        <h1 className="text-center text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-muted-foreground mt-1 text-center text-sm">
          AI Competitor Price Tracker
        </p>
        <div className="mt-8">
          <Suspense fallback={<p className="text-muted-foreground text-sm">Loading…</p>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

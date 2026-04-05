import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to AI Competitor Price Tracker",
};

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Use a valid email and a password of at least 8 characters (demo
        authentication).
      </p>
      <LoginForm className="mt-6" />
    </div>
  );
}

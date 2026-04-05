"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword,
        }),
      });
      const data = (await res.json()) as {
        fieldErrors?: Record<string, string>;
        error?: string;
      };
      if (!res.ok) {
        if (data.fieldErrors) setFieldErrors(data.fieldErrors);
        else
          setFieldErrors({
            email: data.error || "Something went wrong",
          });
        return;
      }
      router.push("/");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Register to start tracking competitor prices.
      </p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
        <div className="space-y-1">
          <label htmlFor="reg-name" className="text-sm font-medium">
            Name
          </label>
          <Input
            id="reg-name"
            name="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? "reg-name-error" : undefined}
          />
          {fieldErrors.name ? (
            <p id="reg-name-error" className="text-sm text-destructive">
              {fieldErrors.name}
            </p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label htmlFor="reg-email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="reg-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={
              fieldErrors.email ? "reg-email-error" : undefined
            }
          />
          {fieldErrors.email ? (
            <p id="reg-email-error" className="text-sm text-destructive">
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label htmlFor="reg-password" className="text-sm font-medium">
            Password
          </label>
          <Input
            id="reg-password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={
              fieldErrors.password ? "reg-password-error" : undefined
            }
          />
          {fieldErrors.password ? (
            <p id="reg-password-error" className="text-sm text-destructive">
              {fieldErrors.password}
            </p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label htmlFor="reg-confirm" className="text-sm font-medium">
            Confirm password
          </label>
          <Input
            id="reg-confirm"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            aria-invalid={Boolean(fieldErrors.confirmPassword)}
            aria-describedby={
              fieldErrors.confirmPassword ? "reg-confirm-error" : undefined
            }
          />
          {fieldErrors.confirmPassword ? (
            <p id="reg-confirm-error" className="text-sm text-destructive">
              {fieldErrors.confirmPassword}
            </p>
          ) : null}
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

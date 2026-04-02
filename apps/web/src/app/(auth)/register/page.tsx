"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerSchema, type RegisterInput } from "@price-tracker/shared";
import { useAuthStore } from "@/stores/auth-store";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AuthResponse } from "@price-tracker/shared";

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth, isAuthenticated } = useAuthStore();
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    firstFieldRef.current?.focus();
  }, []);

  const password = watch("password", "");

  const onSubmit = async (data: RegisterInput) => {
    try {
      const result = await apiClient.postPublic<AuthResponse>(
        "/api/auth/register",
        data
      );
      setAuth(result.user, result.accessToken);
      router.push("/");
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "EMAIL_TAKEN") {
          setError("email", {
            message: "An account with this email already exists.",
          });
        } else {
          setError("root", {
            message: err.message ?? "Registration failed. Please try again.",
          });
        }
      } else {
        setError("root", { message: "An unexpected error occurred." });
      }
    }
  };

  const getPasswordStrength = (pw: string): { label: string; color: string } => {
    if (!pw) return { label: "", color: "" };
    const hasUpper = /[A-Z]/.test(pw);
    const hasNumber = /[0-9]/.test(pw);
    const isLong = pw.length >= 12;
    const score = (hasUpper ? 1 : 0) + (hasNumber ? 1 : 0) + (isLong ? 1 : 0);
    if (pw.length < 8) return { label: "Too short", color: "text-destructive" };
    if (score === 1) return { label: "Weak", color: "text-orange-500" };
    if (score === 2) return { label: "Good", color: "text-yellow-500" };
    return { label: "Strong", color: "text-green-600" };
  };

  const strength = getPasswordStrength(password);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Create account</CardTitle>
        <CardDescription>
          Sign up to start tracking competitor prices.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          id="register-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-4"
        >
          {errors.root && (
            <div
              role="alert"
              aria-live="assertive"
              className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive"
            >
              {errors.root.message}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              aria-describedby={errors.name ? "name-error" : undefined}
              aria-invalid={!!errors.name}
              {...register("name")}
              ref={(el) => {
                register("name").ref(el);
                (firstFieldRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
              }}
            />
            {errors.name && (
              <p id="name-error" role="alert" className="text-sm text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-describedby={errors.email ? "email-error" : undefined}
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            {errors.email && (
              <p id="email-error" role="alert" className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              aria-describedby={
                errors.password
                  ? "password-error"
                  : password
                    ? "password-strength"
                    : undefined
              }
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            {errors.password ? (
              <p id="password-error" role="alert" className="text-sm text-destructive">
                {errors.password.message}
              </p>
            ) : (
              strength.label && (
                <p id="password-strength" className={`text-sm ${strength.color}`}>
                  Password strength: {strength.label}
                </p>
              )
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              aria-describedby={
                errors.confirmPassword ? "confirm-password-error" : undefined
              }
              aria-invalid={!!errors.confirmPassword}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p
                id="confirm-password-error"
                role="alert"
                className="text-sm text-destructive"
              >
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-4">
        <Button
          type="submit"
          form="register-form"
          className="w-full"
          disabled={isSubmitting}
          aria-disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>

        <p className="text-sm text-center text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary underline underline-offset-4 hover:text-primary/80"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

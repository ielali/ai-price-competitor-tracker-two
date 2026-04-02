"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginSchema, type LoginInput } from "@price-tracker/shared";
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

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, isAuthenticated } = useAuthStore();
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    firstFieldRef.current?.focus();
  }, []);

  const onSubmit = async (data: LoginInput) => {
    try {
      const result = await apiClient.postPublic<AuthResponse>(
        "/api/auth/login",
        data
      );
      setAuth(result.user, result.accessToken);
      router.push("/");
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "RATE_LIMITED") {
          setError("root", {
            message:
              "Too many failed login attempts. Please try again later.",
          });
        } else {
          setError("root", {
            message: err.message ?? "Invalid email or password.",
          });
        }
      } else {
        setError("root", { message: "An unexpected error occurred." });
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Sign in</CardTitle>
        <CardDescription>
          Enter your email and password to access your account.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          id="login-form"
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
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-describedby={errors.email ? "email-error" : undefined}
              aria-invalid={!!errors.email}
              {...register("email")}
              ref={(el) => {
                register("email").ref(el);
                (firstFieldRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
              }}
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
              autoComplete="current-password"
              aria-describedby={errors.password ? "password-error" : undefined}
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            {errors.password && (
              <p id="password-error" role="alert" className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="text-right">
            <span className="text-sm text-muted-foreground">
              Forgot password?{" "}
              <span className="text-sm text-muted-foreground italic">
                (coming soon)
              </span>
            </span>
          </div>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-4">
        <Button
          type="submit"
          form="login-form"
          className="w-full"
          disabled={isSubmitting}
          aria-disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>

        <p className="text-sm text-center text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-primary underline underline-offset-4 hover:text-primary/80"
          >
            Register
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

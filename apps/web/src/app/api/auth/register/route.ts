import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  signAccessToken,
  signRefreshToken,
} from "@/lib/auth/jwt";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessCookieBase,
  refreshCookieBase,
} from "@/lib/auth/cookies";
import { hashPassword } from "@/lib/auth/password";
import { createUser, findUserByEmail } from "@/lib/auth/user-store";
import { allowRateLimit, getClientKey } from "@/lib/auth/rate-limit";

const AUTH_WINDOW_MS = 60_000;
const AUTH_MAX_PER_WINDOW = 20;

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export async function POST(request: Request) {
  const ip = getClientKey(request);
  if (!allowRateLimit(`auth:${ip}`, AUTH_MAX_PER_WINDOW, AUTH_WINDOW_MS)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const rec = body as Record<string, unknown>;
  const name = typeof rec.name === "string" ? rec.name.trim() : "";
  const emailRaw = typeof rec.email === "string" ? rec.email.trim() : "";
  const password = typeof rec.password === "string" ? rec.password : "";
  const confirm =
    typeof rec.confirmPassword === "string" ? rec.confirmPassword : "";

  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = "Name is required";
  if (!emailRaw) fieldErrors.email = "Email is required";
  else if (!emailOk(emailRaw)) fieldErrors.email = "Enter a valid email address";
  if (!password) fieldErrors.password = "Password is required";
  else if (password.length < 8)
    fieldErrors.password = "Password must be at least 8 characters";
  if (password !== confirm)
    fieldErrors.confirmPassword = "Passwords do not match";

  if (Object.keys(fieldErrors).length) {
    return NextResponse.json({ fieldErrors }, { status: 400 });
  }

  if (findUserByEmail(emailRaw)) {
    return NextResponse.json(
      {
        fieldErrors: { email: "An account with this email already exists" },
      },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  const user = createUser({
    email: emailRaw,
    name,
    passwordHash,
    role: "user",
  });

  if (!user) {
    return NextResponse.json(
      { fieldErrors: { email: "An account with this email already exists" } },
      { status: 409 }
    );
  }

  const claims = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };
  const [access, refresh] = await Promise.all([
    signAccessToken(claims),
    signRefreshToken(claims),
  ]);

  const c = cookies();
  c.set(ACCESS_COOKIE, access, accessCookieBase);
  c.set(REFRESH_COOKIE, refresh, refreshCookieBase);

  return NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
}

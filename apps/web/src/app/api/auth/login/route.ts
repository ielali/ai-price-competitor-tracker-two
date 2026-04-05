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
import { verifyPassword } from "@/lib/auth/password";
import { findUserByEmail } from "@/lib/auth/user-store";
import { allowRateLimit, getClientKey } from "@/lib/auth/rate-limit";

const AUTH_WINDOW_MS = 60_000;
const AUTH_MAX_PER_WINDOW = 20;

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
  const email = typeof rec.email === "string" ? rec.email.trim() : "";
  const password = typeof rec.password === "string" ? rec.password : "";

  const fieldErrors: Record<string, string> = {};
  if (!email) fieldErrors.email = "Email is required";
  if (!password) fieldErrors.password = "Password is required";

  if (Object.keys(fieldErrors).length) {
    return NextResponse.json({ fieldErrors }, { status: 400 });
  }

  const user = findUserByEmail(email);
  const valid =
    user && (await verifyPassword(password, user.passwordHash));

  if (!valid) {
    return NextResponse.json(
      {
        fieldErrors: {
          password: "Invalid email or password",
          email: "Invalid email or password",
        },
      },
      { status: 401 }
    );
  }

  const claims = {
    sub: user!.id,
    email: user!.email,
    role: user!.role,
  };
  const [access, refresh] = await Promise.all([
    signAccessToken(claims),
    signRefreshToken(claims),
  ]);

  const c = cookies();
  c.set(ACCESS_COOKIE, access, accessCookieBase);
  c.set(REFRESH_COOKIE, refresh, refreshCookieBase);

  return NextResponse.json({
    user: { id: user!.id, email: user!.email, name: user!.name, role: user!.role },
  });
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@/lib/auth/jwt";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessCookieBase,
  refreshCookieBase,
} from "@/lib/auth/cookies";
import { allowRateLimit, getClientKey } from "@/lib/auth/rate-limit";

const AUTH_WINDOW_MS = 60_000;
const AUTH_MAX_PER_WINDOW = 30;

export async function POST(request: Request) {
  const ip = getClientKey(request);
  if (!allowRateLimit(`auth-refresh:${ip}`, AUTH_MAX_PER_WINDOW, AUTH_WINDOW_MS)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const c = cookies();
  const refreshTok = c.get(REFRESH_COOKIE)?.value;
  if (!refreshTok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const session = await verifyRefreshToken(refreshTok);
    const access = await signAccessToken(session);
    const rotated = await signRefreshToken(session);

    c.set(ACCESS_COOKIE, access, accessCookieBase);
    c.set(REFRESH_COOKIE, rotated, refreshCookieBase);

    return NextResponse.json({ ok: true });
  } catch {
    c.delete(ACCESS_COOKIE);
    c.delete(REFRESH_COOKIE);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

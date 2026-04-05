import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "@/lib/auth/jwt";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessCookieBase,
  refreshCookieBase,
} from "@/lib/auth/cookies";

export async function middleware(request: NextRequest) {
  const access = request.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;

  if (access) {
    try {
      await verifyAccessToken(access);
      return NextResponse.next();
    } catch {
      /* try refresh */
    }
  }

  if (refresh) {
    try {
      const session = await verifyRefreshToken(refresh);
      const newAccess = await signAccessToken(session);
      const newRefresh = await signRefreshToken(session);
      const res = NextResponse.next();
      res.cookies.set(ACCESS_COOKIE, newAccess, accessCookieBase);
      res.cookies.set(REFRESH_COOKIE, newRefresh, refreshCookieBase);
      return res;
    } catch {
      const login = new URL("/login", request.url);
      login.searchParams.set("from", request.nextUrl.pathname);
      const res = NextResponse.redirect(login);
      res.cookies.set(ACCESS_COOKIE, "", { path: "/", maxAge: 0 });
      res.cookies.set(REFRESH_COOKIE, "", { path: "/", maxAge: 0 });
      return res;
    }
  }

  const login = new URL("/login", request.url);
  login.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|login|register|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

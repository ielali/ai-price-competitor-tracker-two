import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_ROUTES = ["/login", "/register"];
const DASHBOARD_PREFIX = "/";

// Routes that don't require authentication (exact match or prefix)
const PUBLIC_PATHS = new Set(["/login", "/register"]);

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.has(pathname);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for refresh token cookie as a proxy for having a session
  const hasRefreshToken = request.cookies.has("refresh_token");

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Authenticated user trying to access login/register — redirect to dashboard
  if (isAuthRoute && hasRefreshToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Unauthenticated user trying to access a protected route
  if (!isPublicPath(pathname) && !hasRefreshToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Match all request paths except:
   * - _next/static (static files)
   * - _next/image (image optimization)
   * - favicon.ico
   * - Public assets (files with extensions)
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessCookieOptions,
} from '@/lib/auth/cookies';
import { signAccessToken, verifyAccessToken, verifyRefreshToken } from '@/lib/auth/jwt';

function isAsset(pathname: string) {
  return /\.(ico|png|jpg|jpeg|svg|webp|gif)$/.test(pathname);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/') ||
    isAsset(pathname)
  ) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (accessToken) {
    try {
      await verifyAccessToken(accessToken);
      if (isAuthPage) {
        return NextResponse.redirect(new URL('/', request.url));
      }
      return NextResponse.next();
    } catch {
      /* try refresh */
    }
  }

  if (refreshToken) {
    try {
      const { payload } = await verifyRefreshToken(refreshToken);
      const nextAccess = await signAccessToken(payload);
      if (isAuthPage) {
        const redirect = NextResponse.redirect(new URL('/', request.url));
        redirect.cookies.set(ACCESS_COOKIE, nextAccess, accessCookieOptions());
        return redirect;
      }
      const res = NextResponse.next();
      res.cookies.set(ACCESS_COOKIE, nextAccess, accessCookieOptions());
      return res;
    } catch {
      /* fall through */
    }
  }

  if (isAuthPage) {
    return NextResponse.next();
  }

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('callbackUrl', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

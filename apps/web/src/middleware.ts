import NextAuth from 'next-auth';
import authConfig from '@/auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isLogin = req.nextUrl.pathname === '/login';

  if (!isLoggedIn && !isLogin) {
    const loginUrl = new URL('/login', req.nextUrl.origin);
    const callback =
      req.nextUrl.pathname + req.nextUrl.search;
    if (callback && callback !== '/') {
      loginUrl.searchParams.set('callbackUrl', callback);
    }
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isLogin) {
    return NextResponse.redirect(new URL('/', req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.svg$).*)',
  ],
};

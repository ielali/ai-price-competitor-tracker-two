import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const pathname = req.nextUrl.pathname;
  const isLogin = pathname === '/login';
  const loggedIn = !!req.auth;

  if (loggedIn && isLogin) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  if (!loggedIn && !isLogin) {
    const login = new URL('/login', req.nextUrl);
    login.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

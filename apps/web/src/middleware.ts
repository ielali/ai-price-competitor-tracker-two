import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  const isLoginPage = pathname === '/login';

  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  if (!isLoggedIn && !isLoginPage) {
    const url = new URL('/login', req.nextUrl.origin);
    const callback = pathname + req.nextUrl.search;
    if (callback && callback !== '/') {
      url.searchParams.set('callbackUrl', callback);
    }
    return NextResponse.redirect(url);
  }

  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL('/', req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

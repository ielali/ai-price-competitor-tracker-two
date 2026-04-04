import { NextRequest, NextResponse } from 'next/server';
import { ACCESS_COOKIE, REFRESH_COOKIE } from '@/lib/auth/cookies';
import { authRateLimit } from '@/lib/auth/route-helpers';

function clearCookieOpts() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  };
}

export async function POST(request: NextRequest) {
  const limited = authRateLimit(request);
  if (limited) {
    return limited;
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ACCESS_COOKIE, '', clearCookieOpts());
  res.cookies.set(REFRESH_COOKIE, '', clearCookieOpts());
  return res;
}

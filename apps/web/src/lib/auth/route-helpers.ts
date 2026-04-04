import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { signAccessToken, signRefreshToken } from './jwt';
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessCookieOptions,
  refreshCookieOptions,
} from './cookies';
import type { AuthTokenPayload } from './types';
import { checkRateLimit } from './rate-limit';

export function getClientKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() ?? 'unknown';
  }
  return request.ip ?? 'unknown';
}

export function authRateLimit(
  request: NextRequest,
): NextResponse | null {
  const key = `auth:${getClientKey(request)}`;
  const result = checkRateLimit(key, 30, 60_000);
  if (result.ok) {
    return null;
  }
  return NextResponse.json(
    { error: 'Too many requests', retryAfterSec: result.retryAfterSec },
    {
      status: 429,
      headers: { 'Retry-After': String(result.retryAfterSec) },
    },
  );
}

export async function jsonWithAuthCookies(
  data: unknown,
  payload: AuthTokenPayload,
  init?: { status?: number },
) {
  const [access, refresh] = await Promise.all([
    signAccessToken(payload),
    signRefreshToken(payload),
  ]);
  const res = NextResponse.json(data, { status: init?.status ?? 200 });
  res.cookies.set(ACCESS_COOKIE, access, accessCookieOptions());
  res.cookies.set(REFRESH_COOKIE, refresh, refreshCookieOptions());
  return res;
}

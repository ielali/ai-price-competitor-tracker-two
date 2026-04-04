import { NextRequest, NextResponse } from 'next/server';
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessCookieOptions,
  refreshCookieOptions,
} from '@/lib/auth/cookies';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/lib/auth/jwt';
import { authRateLimit } from '@/lib/auth/route-helpers';

export async function POST(request: NextRequest) {
  const limited = authRateLimit(request);
  if (limited) {
    return limited;
  }

  const token = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: 'Missing refresh token' }, { status: 401 });
  }

  try {
    const { payload } = await verifyRefreshToken(token);
    const [access, refresh] = await Promise.all([
      signAccessToken(payload),
      signRefreshToken(payload),
    ]);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ACCESS_COOKIE, access, accessCookieOptions());
    res.cookies.set(REFRESH_COOKIE, refresh, refreshCookieOptions());
    return res;
  } catch {
    return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
  }
}

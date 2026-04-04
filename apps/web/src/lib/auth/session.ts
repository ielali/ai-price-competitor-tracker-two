import { cookies } from 'next/headers';
import { ACCESS_COOKIE } from './cookies';
import { verifyAccessToken } from './jwt';

export type SessionUser = { email: string; name: string };

/**
 * Reads the current user from the HTTP-only access cookie (layout / RSC).
 * Middleware is responsible for refreshing an expired access token when possible.
 */
export async function getSessionFromCookies(): Promise<SessionUser | null> {
  const token = cookies().get(ACCESS_COOKIE)?.value;
  if (!token) {
    return null;
  }
  try {
    const { payload } = await verifyAccessToken(token);
    return { email: payload.email, name: payload.name };
  } catch {
    return null;
  }
}

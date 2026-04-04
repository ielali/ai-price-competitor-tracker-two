import { ACCESS_TTL_SEC, REFRESH_TTL_SEC } from './jwt';

const ACCESS_COOKIE = 'pt_access';
const REFRESH_COOKIE = 'pt_refresh';

export { ACCESS_COOKIE, REFRESH_COOKIE };

export type AuthCookieParams = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax';
  path: string;
  maxAge: number;
};

export function accessCookieOptions(): AuthCookieParams {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ACCESS_TTL_SEC,
  };
}

export function refreshCookieOptions(): AuthCookieParams {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: REFRESH_TTL_SEC,
  };
}

export function clearedAuthCookies(): { name: string; value: string; maxAge: number }[] {
  return [
    { name: ACCESS_COOKIE, value: '', maxAge: 0 },
    { name: REFRESH_COOKIE, value: '', maxAge: 0 },
  ];
}

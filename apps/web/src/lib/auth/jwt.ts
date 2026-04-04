import { SignJWT } from 'jose/jwt/sign';
import { jwtVerify } from 'jose/jwt/verify';
import type { JWTPayload } from 'jose';
import type { AuthTokenPayload, Role } from './types';
import { getJwtSecret } from './secret';

const ACCESS_TTL_SEC = 15 * 60;
const REFRESH_TTL_SEC = 7 * 24 * 60 * 60;

function rolesFromPayload(value: unknown): Role[] {
  if (!Array.isArray(value)) {
    return ['member'];
  }
  const roles = value.filter((r): r is Role => r === 'admin' || r === 'member');
  return roles.length > 0 ? roles : ['member'];
}

export function payloadFromClaims(p: JWTPayload): AuthTokenPayload {
  const sub = p.sub;
  const email = p.email;
  const name = p.name;
  if (typeof sub !== 'string' || typeof email !== 'string' || typeof name !== 'string') {
    throw new Error('Invalid token subject');
  }
  return {
    sub,
    email,
    name,
    roles: rolesFromPayload(p.roles),
  };
}

export async function signAccessToken(data: AuthTokenPayload): Promise<string> {
  return new SignJWT({
    kind: 'access',
    email: data.email,
    name: data.name,
    roles: data.roles,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(data.sub)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TTL_SEC}s`)
    .sign(getJwtSecret());
}

export async function signRefreshToken(data: AuthTokenPayload): Promise<string> {
  return new SignJWT({
    kind: 'refresh',
    email: data.email,
    name: data.name,
    roles: data.roles,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(data.sub)
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_TTL_SEC}s`)
    .sign(getJwtSecret());
}

export async function verifyAccessToken(
  token: string,
): Promise<{ payload: AuthTokenPayload; raw: JWTPayload }> {
  const { payload: raw } = await jwtVerify(token, getJwtSecret());
  if (raw.kind !== 'access') {
    throw new Error('Invalid access token');
  }
  return { payload: payloadFromClaims(raw), raw };
}

export async function verifyRefreshToken(
  token: string,
): Promise<{ payload: AuthTokenPayload; raw: JWTPayload }> {
  const { payload: raw } = await jwtVerify(token, getJwtSecret());
  if (raw.kind !== 'refresh') {
    throw new Error('Invalid refresh token');
  }
  return { payload: payloadFromClaims(raw), raw };
}

export { ACCESS_TTL_SEC, REFRESH_TTL_SEC };

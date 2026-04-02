import bcrypt from 'bcrypt';
import { SignJWT, jwtVerify } from 'jose';
import { eq, and, gt } from 'drizzle-orm';
import { createHash } from 'crypto';
import { db } from '../db/client';
import { tenants, users, refreshTokens } from '../db/schema';
import { Errors } from '../utils/errors';
import type { RegisterInput, LoginInput, AuthResponse } from '@price-tracker/shared';

const BCRYPT_COST = 12;
const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL_DAYS = 7;

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return new TextEncoder().encode(secret);
}

function getRefreshJwtSecret(): Uint8Array {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error('JWT_REFRESH_SECRET is not set');
  return new TextEncoder().encode(secret);
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function generateAccessToken(payload: {
  userId: string;
  tenantId: string;
  role: string;
  email: string;
}): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_TTL)
    .sign(getJwtSecret());
}

export async function generateRefreshToken(userId: string): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_TOKEN_TTL_DAYS}d`)
    .sign(getRefreshJwtSecret());
}

export async function verifyAccessToken(
  token: string
): Promise<{ userId: string; tenantId: string; role: string; email: string }> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as { userId: string; tenantId: string; role: string; email: string };
  } catch {
    throw Errors.tokenInvalid();
  }
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
  const existing = await db.query.users.findFirst({
    where: eq(users.email, input.email),
  });
  if (existing) {
    throw Errors.emailTaken();
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);

  const result = await db.transaction(async (tx) => {
    const [tenant] = await tx
      .insert(tenants)
      .values({ name: `${input.name}'s Organization` })
      .returning();

    const [user] = await tx
      .insert(users)
      .values({
        tenantId: tenant.id,
        email: input.email,
        passwordHash,
        name: input.name,
        role: 'admin',
      })
      .returning();

    return { tenant, user };
  });

  const accessToken = await generateAccessToken({
    userId: result.user.id,
    tenantId: result.tenant.id,
    role: result.user.role,
    email: result.user.email,
  });

  return {
    user: {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      role: result.user.role,
      tenantId: result.tenant.id,
    },
    accessToken,
  };
}

export async function login(
  input: LoginInput
): Promise<AuthResponse & { refreshToken: string }> {
  const user = await db.query.users.findFirst({
    where: eq(users.email, input.email),
  });

  if (!user) {
    throw Errors.invalidCredentials();
  }

  const passwordValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordValid) {
    throw Errors.invalidCredentials();
  }

  const accessToken = await generateAccessToken({
    userId: user.id,
    tenantId: user.tenantId,
    role: user.role,
    email: user.email,
  });

  const refreshToken = await generateRefreshToken(user.id);
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

  await db.insert(refreshTokens).values({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
    },
    accessToken,
    refreshToken,
  };
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<{ accessToken: string }> {
  let userId: string;
  try {
    const { payload } = await jwtVerify(refreshToken, getRefreshJwtSecret());
    userId = payload.userId as string;
  } catch {
    throw Errors.tokenInvalid();
  }

  const tokenHash = hashToken(refreshToken);
  const stored = await db.query.refreshTokens.findFirst({
    where: and(
      eq(refreshTokens.tokenHash, tokenHash),
      gt(refreshTokens.expiresAt, new Date())
    ),
  });

  if (!stored) {
    throw Errors.tokenInvalid();
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    throw Errors.tokenInvalid();
  }

  const accessToken = await generateAccessToken({
    userId: user.id,
    tenantId: user.tenantId,
    role: user.role,
    email: user.email,
  });

  return { accessToken };
}

export async function logout(refreshToken: string): Promise<void> {
  const tokenHash = hashToken(refreshToken);
  await db.delete(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHash));
}

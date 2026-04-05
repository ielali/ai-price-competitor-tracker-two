import { SignJWT, jwtVerify } from "jose";
import type { Role } from "./constants";
import { getAuthSecret } from "./secret";

export type SessionClaims = {
  sub: string;
  email: string;
  role: Role;
};

export async function signAccessToken(claims: SessionClaims): Promise<string> {
  return new SignJWT({
    email: claims.email,
    role: claims.role,
    typ: "access",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(getAuthSecret());
}

export async function signRefreshToken(claims: SessionClaims): Promise<string> {
  return new SignJWT({
    email: claims.email,
    role: claims.role,
    typ: "refresh",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getAuthSecret());
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, getAuthSecret());
  if (payload.typ !== "access") {
    throw new Error("Invalid access token");
  }
  return {
    sub: String(payload.sub),
    email: String(payload.email),
    role: payload.role as Role,
  };
}

export async function verifyRefreshToken(token: string) {
  const { payload } = await jwtVerify(token, getAuthSecret());
  if (payload.typ !== "refresh") {
    throw new Error("Invalid refresh token");
  }
  return {
    sub: String(payload.sub),
    email: String(payload.email),
    role: payload.role as Role,
  };
}

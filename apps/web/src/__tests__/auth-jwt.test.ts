/** @vitest-environment node */
import { describe, it, expect, beforeEach } from "vitest";
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "@/lib/auth/jwt";

describe("auth jwt", () => {
  beforeEach(() => {
    process.env.AUTH_SECRET = "test-auth-secret-32-characters-min!!";
  });

  it("round-trips access token claims", async () => {
    const claims = {
      sub: "user-1",
      email: "u@example.com",
      role: "user" as const,
    };
    const token = await signAccessToken(claims);
    const out = await verifyAccessToken(token);
    expect(out).toEqual(claims);
  });

  it("rejects refresh token as access", async () => {
    const claims = {
      sub: "user-1",
      email: "u@example.com",
      role: "user" as const,
    };
    const refresh = await signRefreshToken(claims);
    await expect(verifyAccessToken(refresh)).rejects.toThrow();
  });

  it("round-trips refresh token", async () => {
    const claims = {
      sub: "user-1",
      email: "u@example.com",
      role: "admin" as const,
    };
    const token = await signRefreshToken(claims);
    const out = await verifyRefreshToken(token);
    expect(out).toEqual(claims);
  });
});

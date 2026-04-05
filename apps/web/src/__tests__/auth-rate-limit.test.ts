import { describe, it, expect } from "vitest";
import { allowRateLimit } from "@/lib/auth/rate-limit";

describe("auth rate limit", () => {
  it("allows under limit then blocks", () => {
    const key = `t-${Math.random()}`;
    expect(allowRateLimit(key, 3, 60_000)).toBe(true);
    expect(allowRateLimit(key, 3, 60_000)).toBe(true);
    expect(allowRateLimit(key, 3, 60_000)).toBe(true);
    expect(allowRateLimit(key, 3, 60_000)).toBe(false);
  });
});

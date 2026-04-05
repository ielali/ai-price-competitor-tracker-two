import { describe, expect, it } from "vitest";

import { validateLoginInput } from "@/lib/auth-validation";

describe("validateLoginInput", () => {
  it("accepts a valid email and password", () => {
    const r = validateLoginInput("user@example.com", "password123");
    expect(r).toEqual({ ok: true, email: "user@example.com" });
  });

  it("trims email", () => {
    const r = validateLoginInput("  user@example.com  ", "password123");
    expect(r).toEqual({ ok: true, email: "user@example.com" });
  });

  it("rejects invalid email", () => {
    const r = validateLoginInput("not-an-email", "password123");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.message).toMatch(/valid email/i);
    }
  });

  it("rejects short password", () => {
    const r = validateLoginInput("user@example.com", "short");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.message).toMatch(/8 characters/i);
    }
  });

  it("rejects non-string inputs", () => {
    expect(validateLoginInput(null, "password123").ok).toBe(false);
    expect(validateLoginInput("user@example.com", null).ok).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { safeAppPath, safeRelativeCallback } from "@/lib/safe-relative-path";

describe("safeAppPath", () => {
  it("allows root", () => {
    expect(safeAppPath("/")).toBe("/");
  });

  it("allows relative dashboard paths", () => {
    expect(safeAppPath("/products")).toBe("/products");
    expect(safeAppPath("/settings?tab=general")).toBe("/settings?tab=general");
  });

  it("rejects protocol-relative and absolute URLs", () => {
    expect(safeAppPath("//evil.test/phish")).toBeNull();
    expect(safeAppPath("https://evil.test/")).toBeNull();
  });

  it("rejects bare paths without leading slash", () => {
    expect(safeAppPath("products")).toBeNull();
  });
});

describe("safeRelativeCallback", () => {
  it("joins pathname and search", () => {
    expect(safeRelativeCallback("/reports", "?x=1")).toBe("/reports?x=1");
  });

  it("returns null for open redirects", () => {
    expect(safeRelativeCallback("//evil", "")).toBeNull();
  });
});

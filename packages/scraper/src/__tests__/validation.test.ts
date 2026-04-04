import { describe, expect, it } from "vitest";
import { scrapeJobPayloadSchema } from "../validation.js";

describe("scrapeJobPayloadSchema", () => {
  it("accepts sourceId only", () => {
    const r = scrapeJobPayloadSchema.safeParse({ sourceId: "src-1" });
    expect(r.success).toBe(true);
  });

  it("accepts sourceId with valid url", () => {
    const r = scrapeJobPayloadSchema.safeParse({
      sourceId: "src-1",
      url: "https://example.com/p/1"
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty sourceId", () => {
    const r = scrapeJobPayloadSchema.safeParse({ sourceId: "" });
    expect(r.success).toBe(false);
  });

  it("rejects invalid url", () => {
    const r = scrapeJobPayloadSchema.safeParse({
      sourceId: "s",
      url: "not-a-url"
    });
    expect(r.success).toBe(false);
  });
});

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { ScrapingQueue } from "@price-tracker/scraper";
import { buildApp } from "./app.js";

describe("buildApp", () => {
  let app: Awaited<ReturnType<typeof buildApp>>["app"];
  let close: () => Promise<void>;
  let fakeQueue: ScrapingQueue;

  beforeAll(async () => {
    fakeQueue = {
      add: vi.fn().mockResolvedValue({ id: "job-1" })
    } as unknown as ScrapingQueue;
    const built = await buildApp({ scrapingQueue: fakeQueue });
    app = built.app;
    close = built.close;
  });

  afterAll(async () => {
    await close();
  });

  it("returns health", async () => {
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ ok: true });
  });

  it("rejects invalid scrape payload", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/jobs/scrape",
      payload: { sourceId: "" }
    });
    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect(body.error).toBe("invalid_payload");
  });

  it("enqueues scrape job", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/jobs/scrape",
      payload: { sourceId: "comp-a", url: "https://example.com/p/1" }
    });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ jobId: "job-1" });
    expect(fakeQueue.add).toHaveBeenCalled();
  });
});

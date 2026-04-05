import { describe, it, expect } from "vitest";

import { getScrapingStatus } from "@/lib/scraping-status";

describe("getScrapingStatus", () => {
  it("returns counts that match recentJobs", () => {
    const payload = getScrapingStatus();

    expect(payload.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(payload.recentJobs.length).toBeGreaterThan(0);

    const fromJobs = {
      queued: payload.recentJobs.filter((j) => j.status === "queued").length,
      active: payload.recentJobs.filter((j) => j.status === "active").length,
      completed: payload.recentJobs.filter((j) => j.status === "completed")
        .length,
      failed: payload.recentJobs.filter((j) => j.status === "failed").length,
    };

    expect(payload.counts).toEqual(fromJobs);
  });

  it("includes required fields on each job", () => {
    const { recentJobs } = getScrapingStatus();

    for (const job of recentJobs) {
      expect(job.id).toBeTruthy();
      expect(["queued", "active", "completed", "failed"]).toContain(
        job.status,
      );
      expect(job.sourceLabel).toBeTruthy();
      expect(job.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    }
  });
});

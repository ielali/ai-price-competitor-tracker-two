export type ScrapingJobStatus = "queued" | "active" | "completed" | "failed";

export interface ScrapingJobSummary {
  id: string;
  status: ScrapingJobStatus;
  sourceLabel: string;
  updatedAt: string;
}

export interface ScrapingStatusCounts {
  queued: number;
  active: number;
  completed: number;
  failed: number;
}

export interface ScrapingStatusPayload {
  generatedAt: string;
  counts: ScrapingStatusCounts;
  recentJobs: ScrapingJobSummary[];
}

/**
 * Returns scraping queue metrics for the dashboard.
 * Today this is deterministic demo data shaped like future BullMQ aggregates;
 * wire to Redis / queue stats without changing the public payload.
 */
export function getScrapingStatus(): ScrapingStatusPayload {
  const recentJobs: ScrapingJobSummary[] = [
    {
      id: "job-8f2a",
      status: "active",
      sourceLabel: "Example Retail — Weekly Price Check",
      updatedAt: "2026-04-05T10:02:00.000Z",
    },
    {
      id: "job-7c11",
      status: "queued",
      sourceLabel: "Marketplace Vendor A",
      updatedAt: "2026-04-05T10:01:30.000Z",
    },
    {
      id: "job-6d04",
      status: "completed",
      sourceLabel: "Competitor X — PDP scrape",
      updatedAt: "2026-04-05T09:58:12.000Z",
    },
    {
      id: "job-5aa0",
      status: "failed",
      sourceLabel: "Stale selector — Outlet Site",
      updatedAt: "2026-04-05T09:55:44.000Z",
    },
    {
      id: "job-4b9e",
      status: "completed",
      sourceLabel: "Example Retail — Weekly Price Check",
      updatedAt: "2026-04-05T09:50:00.000Z",
    },
  ];

  const counts: ScrapingStatusCounts = {
    queued: recentJobs.filter((j) => j.status === "queued").length,
    active: recentJobs.filter((j) => j.status === "active").length,
    completed: recentJobs.filter((j) => j.status === "completed").length,
    failed: recentJobs.filter((j) => j.status === "failed").length,
  };

  return {
    generatedAt: "2026-04-05T10:02:00.000Z",
    counts,
    recentJobs,
  };
}

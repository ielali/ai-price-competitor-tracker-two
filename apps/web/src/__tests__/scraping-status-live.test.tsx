import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ScrapingStatusLive } from "@/components/dashboard/scraping-status-live";
import type { ScrapingStatusPayload } from "@/lib/scraping-status";

const payload: ScrapingStatusPayload = {
  generatedAt: "2026-04-05T12:00:00.000Z",
  counts: { queued: 0, active: 1, completed: 2, failed: 0 },
  recentJobs: [
    {
      id: "job-api-1",
      status: "active",
      sourceLabel: "From API",
      updatedAt: "2026-04-05T11:00:00.000Z",
    },
  ],
};

describe("ScrapingStatusLive", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows a loading skeleton before the first successful response", () => {
    vi.mocked(fetch).mockImplementation(
      () => new Promise(() => {}),
    );

    render(<ScrapingStatusLive />);

    expect(
      screen.getByRole("region", { name: /scraping activity loading/i }),
    ).toBeInTheDocument();
  });

  it("loads scraping status from /api/scraping/status", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => payload,
    } as Response);

    render(<ScrapingStatusLive />);

    await waitFor(() => {
      expect(
        screen.getByRole("region", { name: /scraping activity/i }),
      ).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/scraping/status",
      expect.objectContaining({
        credentials: "same-origin",
        cache: "no-store",
      }),
    );

    expect(screen.getByRole("cell", { name: "job-api-1" })).toBeInTheDocument();
    expect(screen.getByText("From API")).toBeInTheDocument();
  });

  it("shows an alert when the API returns an error before any data", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 503,
    } as Response);

    render(<ScrapingStatusLive />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    expect(
      screen.getByText(/scraping status request failed \(503\)/i),
    ).toBeInTheDocument();
  });

  it("schedules a 60 second polling interval after mount", async () => {
    const intervalSpy = vi.spyOn(window, "setInterval");
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => payload,
    } as Response);

    render(<ScrapingStatusLive />);

    await waitFor(() => {
      expect(intervalSpy).toHaveBeenCalledWith(expect.any(Function), 60_000);
    });

    intervalSpy.mockRestore();
  });
});

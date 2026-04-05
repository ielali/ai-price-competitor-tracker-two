import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { ScrapingStatusView } from "@/components/dashboard/scraping-status-view";
import type { ScrapingStatusPayload } from "@/lib/scraping-status";

const sample: ScrapingStatusPayload = {
  generatedAt: "2026-04-05T12:00:00.000Z",
  counts: { queued: 1, active: 1, completed: 1, failed: 1 },
  recentJobs: [
    {
      id: "job-test-1",
      status: "active",
      sourceLabel: "Demo source",
      updatedAt: "2026-04-05T11:00:00.000Z",
    },
  ],
};

describe("ScrapingStatusView", () => {
  it("renders summary counts and job row", () => {
    render(<ScrapingStatusView data={sample} />);

    expect(
      screen.getByRole("region", { name: /scraping activity/i }),
    ).toBeInTheDocument();

    expect(screen.getAllByText("1")).toHaveLength(4);
    expect(screen.getByText("Queued")).toBeInTheDocument();
    expect(screen.getAllByText("Active").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("Failed")).toBeInTheDocument();

    const table = screen.getByRole("table");
    expect(
      within(table).getByRole("cell", { name: "job-test-1" }),
    ).toBeInTheDocument();
    expect(within(table).getByText("Demo source")).toBeInTheDocument();
    expect(within(table).getByText("Active")).toBeInTheDocument();
  });
});

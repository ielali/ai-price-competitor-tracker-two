import { describe, it, expect } from "vitest";
import { getDashboardOverview } from "@/lib/dashboard-overview";

describe("getDashboardOverview", () => {
  it("returns four summary stats with stable ids", () => {
    const overview = getDashboardOverview();
    expect(overview.stats).toHaveLength(4);
    expect(overview.stats.map((s) => s.id)).toEqual([
      "products",
      "competitors",
      "alerts",
      "scrapes",
    ]);
  });

  it("includes recent alerts with known severities", () => {
    const overview = getDashboardOverview();
    expect(overview.recentAlerts.length).toBeGreaterThanOrEqual(1);
    for (const row of overview.recentAlerts) {
      expect(row.id).toBeTruthy();
      expect(row.title).toBeTruthy();
      expect(row.productName).toBeTruthy();
      expect(["critical", "warning", "info"]).toContain(row.severity);
    }
  });

  it("surfaces last sync copy for the header", () => {
    const overview = getDashboardOverview();
    expect(overview.lastFullSyncLabel).toMatch(/UTC/);
  });
});

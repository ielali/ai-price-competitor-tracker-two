import { describe, it, expect } from "vitest";
import {
  filterAlertEntries,
  countUnreadAlerts,
} from "@/lib/alert-history-filters";
import type { AlertHistoryEntry } from "@/lib/alert-history-types";

const sample: AlertHistoryEntry[] = [
  {
    id: "1",
    occurredAt: "2026-04-10T12:00:00.000Z",
    productId: "p1",
    productName: "A",
    triggerCondition: "t1",
    channel: "Email",
    status: "new",
    archived: false,
  },
  {
    id: "2",
    occurredAt: "2026-04-01T12:00:00.000Z",
    productId: "p2",
    productName: "B",
    triggerCondition: "t2",
    channel: "Slack",
    status: "acknowledged",
    archived: false,
  },
  {
    id: "3",
    occurredAt: "2026-04-15T12:00:00.000Z",
    productId: "p1",
    productName: "A",
    triggerCondition: "t3",
    channel: "Webhook",
    status: "resolved",
    archived: true,
  },
];

describe("filterAlertEntries", () => {
  it("filters by product", () => {
    const out = filterAlertEntries(sample, {
      productFilter: "p2",
      statusFilter: "all",
      dateFrom: "",
      dateTo: "",
      showArchived: true,
    });
    expect(out.map((e) => e.id)).toEqual(["2"]);
  });

  it("filters by status", () => {
    const out = filterAlertEntries(sample, {
      productFilter: "all",
      statusFilter: "new",
      dateFrom: "",
      dateTo: "",
      showArchived: true,
    });
    expect(out.map((e) => e.id)).toEqual(["1"]);
  });

  it("excludes archived by default", () => {
    const out = filterAlertEntries(sample, {
      productFilter: "all",
      statusFilter: "all",
      dateFrom: "",
      dateTo: "",
      showArchived: false,
    });
    expect(out.map((e) => e.id)).toEqual(["1", "2"]);
  });

  it("includes archived when enabled", () => {
    const out = filterAlertEntries(sample, {
      productFilter: "all",
      statusFilter: "all",
      dateFrom: "",
      dateTo: "",
      showArchived: true,
    });
    expect(out).toHaveLength(3);
  });

  it("filters by inclusive date range", () => {
    const out = filterAlertEntries(sample, {
      productFilter: "all",
      statusFilter: "all",
      dateFrom: "2026-04-10",
      dateTo: "2026-04-10",
      showArchived: true,
    });
    expect(out.map((e) => e.id)).toEqual(["1"]);
  });
});

describe("countUnreadAlerts", () => {
  it("counts non-archived new alerts", () => {
    expect(countUnreadAlerts(sample)).toBe(1);
  });
});

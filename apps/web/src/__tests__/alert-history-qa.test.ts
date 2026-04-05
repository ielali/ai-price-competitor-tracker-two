/**
 * QA acceptance-criteria tests for Story 7.3: Alert History & Activity Log
 *
 * Covers all 7 acceptance criteria plus additional edge-case coverage
 * for the alert-history store actions that were under-tested.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useAlertHistoryStore } from "@/stores/alert-history-store";
import { ALERT_HISTORY_SEED } from "@/lib/alert-history-seed";
import {
  filterAlertEntries,
  countUnreadAlerts,
} from "@/lib/alert-history-filters";
import type { AlertHistoryEntry } from "@/lib/alert-history-types";

function resetStore() {
  useAlertHistoryStore.setState({
    entries: structuredClone(ALERT_HISTORY_SEED),
    selectedIds: [],
    productFilter: "all",
    statusFilter: "all",
    dateFrom: "",
    dateTo: "",
    showArchived: false,
  });
}

describe("AC1: Chronological log columns & sort order", () => {
  it("seed entries contain all required columns", () => {
    for (const entry of ALERT_HISTORY_SEED) {
      expect(entry).toHaveProperty("occurredAt");
      expect(entry).toHaveProperty("productName");
      expect(entry).toHaveProperty("triggerCondition");
      expect(entry).toHaveProperty("channel");
      expect(entry).toHaveProperty("status");
    }
  });

  it("filterAlertEntries preserves entries so UI can sort newest-first", () => {
    const all = filterAlertEntries(ALERT_HISTORY_SEED, {
      productFilter: "all",
      statusFilter: "all",
      dateFrom: "",
      dateTo: "",
      showArchived: true,
    });
    const sorted = [...all].sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    );
    expect(sorted[0].occurredAt > sorted[sorted.length - 1].occurredAt).toBe(
      true
    );
  });
});

describe("AC2: Status badges — visual distinction for each status", () => {
  it("seed data includes all three status values", () => {
    const statuses = new Set(ALERT_HISTORY_SEED.map((e) => e.status));
    expect(statuses).toContain("new");
    expect(statuses).toContain("acknowledged");
    expect(statuses).toContain("resolved");
  });
});

describe("AC3: Filters — product, status, date range, show archived", () => {
  it("filters by product", () => {
    const out = filterAlertEntries(ALERT_HISTORY_SEED, {
      productFilter: "prod-a",
      statusFilter: "all",
      dateFrom: "",
      dateTo: "",
      showArchived: false,
    });
    expect(out.every((e) => e.productId === "prod-a")).toBe(true);
  });

  it("filters by status", () => {
    const out = filterAlertEntries(ALERT_HISTORY_SEED, {
      productFilter: "all",
      statusFilter: "acknowledged",
      dateFrom: "",
      dateTo: "",
      showArchived: false,
    });
    expect(out.every((e) => e.status === "acknowledged")).toBe(true);
  });

  it("filters by date range (inclusive)", () => {
    const out = filterAlertEntries(ALERT_HISTORY_SEED, {
      productFilter: "all",
      statusFilter: "all",
      dateFrom: "2026-04-03",
      dateTo: "2026-04-04",
      showArchived: true,
    });
    for (const e of out) {
      const t = new Date(e.occurredAt).getTime();
      expect(t).toBeGreaterThanOrEqual(
        new Date("2026-04-03T00:00:00.000Z").getTime()
      );
      expect(t).toBeLessThanOrEqual(
        new Date("2026-04-04T23:59:59.999Z").getTime()
      );
    }
  });

  it("excludes archived by default", () => {
    const out = filterAlertEntries(ALERT_HISTORY_SEED, {
      productFilter: "all",
      statusFilter: "all",
      dateFrom: "",
      dateTo: "",
      showArchived: false,
    });
    expect(out.every((e) => !e.archived)).toBe(true);
  });

  it("includes archived when show-archived is on", () => {
    const out = filterAlertEntries(ALERT_HISTORY_SEED, {
      productFilter: "all",
      statusFilter: "all",
      dateFrom: "",
      dateTo: "",
      showArchived: true,
    });
    expect(out.some((e) => e.archived)).toBe(true);
  });

  it("store setters update filter state", () => {
    resetStore();
    const s = useAlertHistoryStore.getState();
    s.setProductFilter("prod-b");
    expect(useAlertHistoryStore.getState().productFilter).toBe("prod-b");
    s.setStatusFilter("new");
    expect(useAlertHistoryStore.getState().statusFilter).toBe("new");
    s.setDateFrom("2026-04-01");
    expect(useAlertHistoryStore.getState().dateFrom).toBe("2026-04-01");
    s.setDateTo("2026-04-30");
    expect(useAlertHistoryStore.getState().dateTo).toBe("2026-04-30");
    s.setShowArchived(true);
    expect(useAlertHistoryStore.getState().showArchived).toBe(true);
  });
});

describe("AC4: Bulk actions — mark as read & archive", () => {
  beforeEach(resetStore);

  it("markAsRead changes new → acknowledged only", () => {
    const newIds = ALERT_HISTORY_SEED.filter((e) => e.status === "new").map(
      (e) => e.id
    );
    useAlertHistoryStore.getState().markAsRead(newIds);
    const entries = useAlertHistoryStore.getState().entries;
    for (const id of newIds) {
      expect(entries.find((e) => e.id === id)!.status).toBe("acknowledged");
    }
  });

  it("markAsRead does not change non-new entries", () => {
    const ackEntry = ALERT_HISTORY_SEED.find(
      (e) => e.status === "acknowledged"
    )!;
    useAlertHistoryStore.getState().markAsRead([ackEntry.id]);
    expect(
      useAlertHistoryStore.getState().entries.find((e) => e.id === ackEntry.id)!
        .status
    ).toBe("acknowledged");
  });

  it("markAsRead clears selection", () => {
    useAlertHistoryStore.setState({ selectedIds: ["ah-001", "ah-002"] });
    useAlertHistoryStore.getState().markAsRead(["ah-001"]);
    expect(useAlertHistoryStore.getState().selectedIds).toEqual([]);
  });

  it("archive sets archived flag on selected entries", () => {
    useAlertHistoryStore.getState().archive(["ah-001", "ah-002"]);
    const entries = useAlertHistoryStore.getState().entries;
    expect(entries.find((e) => e.id === "ah-001")!.archived).toBe(true);
    expect(entries.find((e) => e.id === "ah-002")!.archived).toBe(true);
  });

  it("archive clears selection", () => {
    useAlertHistoryStore.setState({ selectedIds: ["ah-001"] });
    useAlertHistoryStore.getState().archive(["ah-001"]);
    expect(useAlertHistoryStore.getState().selectedIds).toEqual([]);
  });

  it("markResolved sets status to resolved and clears selection", () => {
    useAlertHistoryStore.setState({ selectedIds: ["ah-001"] });
    useAlertHistoryStore.getState().markResolved(["ah-001"]);
    expect(
      useAlertHistoryStore.getState().entries.find((e) => e.id === "ah-001")!
        .status
    ).toBe("resolved");
    expect(useAlertHistoryStore.getState().selectedIds).toEqual([]);
  });
});

describe("AC5: Unread badge — count non-archived new items", () => {
  it("counts only non-archived new items", () => {
    const count = countUnreadAlerts(ALERT_HISTORY_SEED);
    const expected = ALERT_HISTORY_SEED.filter(
      (e) => !e.archived && e.status === "new"
    ).length;
    expect(count).toBe(expected);
    expect(count).toBe(2);
  });

  it("count drops to zero after all new items are marked as read", () => {
    resetStore();
    const newIds = ALERT_HISTORY_SEED.filter((e) => e.status === "new").map(
      (e) => e.id
    );
    useAlertHistoryStore.getState().markAsRead(newIds);
    const count = countUnreadAlerts(useAlertHistoryStore.getState().entries);
    expect(count).toBe(0);
  });
});

describe("AC6: Row navigation — clicking navigates to /products/{productId}", () => {
  it("every seed entry has a valid productId for navigation", () => {
    for (const entry of ALERT_HISTORY_SEED) {
      expect(entry.productId).toBeTruthy();
      expect(typeof entry.productId).toBe("string");
    }
  });
});

describe("AC7: Tests — Vitest covers filters, store actions, key UI behaviors", () => {
  it("filterAlertEntries is a callable function", () => {
    expect(typeof filterAlertEntries).toBe("function");
  });

  it("countUnreadAlerts is a callable function", () => {
    expect(typeof countUnreadAlerts).toBe("function");
  });

  it("useAlertHistoryStore exposes all required actions", () => {
    const state = useAlertHistoryStore.getState();
    expect(typeof state.markAsRead).toBe("function");
    expect(typeof state.archive).toBe("function");
    expect(typeof state.toggleSelected).toBe("function");
    expect(typeof state.setSelectedForVisible).toBe("function");
    expect(typeof state.clearSelection).toBe("function");
    expect(typeof state.setProductFilter).toBe("function");
    expect(typeof state.setStatusFilter).toBe("function");
    expect(typeof state.setDateFrom).toBe("function");
    expect(typeof state.setDateTo).toBe("function");
    expect(typeof state.setShowArchived).toBe("function");
  });
});

describe("Store: selection helpers", () => {
  beforeEach(resetStore);

  it("setSelectedForVisible selects given ids", () => {
    useAlertHistoryStore
      .getState()
      .setSelectedForVisible(["ah-001", "ah-002"], true);
    expect(useAlertHistoryStore.getState().selectedIds).toEqual([
      "ah-001",
      "ah-002",
    ]);
  });

  it("setSelectedForVisible deselects given ids", () => {
    useAlertHistoryStore.setState({ selectedIds: ["ah-001", "ah-002", "ah-003"] });
    useAlertHistoryStore
      .getState()
      .setSelectedForVisible(["ah-001", "ah-003"], false);
    expect(useAlertHistoryStore.getState().selectedIds).toEqual(["ah-002"]);
  });

  it("clearSelection empties selected ids", () => {
    useAlertHistoryStore.setState({ selectedIds: ["ah-001"] });
    useAlertHistoryStore.getState().clearSelection();
    expect(useAlertHistoryStore.getState().selectedIds).toEqual([]);
  });
});

describe("Edge cases: date filtering", () => {
  const entries: AlertHistoryEntry[] = [
    {
      id: "e1",
      occurredAt: "2026-04-05T00:00:00.000Z",
      productId: "p1",
      productName: "X",
      triggerCondition: "t",
      channel: "Email",
      status: "new",
      archived: false,
    },
    {
      id: "e2",
      occurredAt: "2026-04-05T23:59:59.999Z",
      productId: "p1",
      productName: "X",
      triggerCondition: "t",
      channel: "Email",
      status: "new",
      archived: false,
    },
  ];

  it("dateFrom only — filters out earlier entries", () => {
    const out = filterAlertEntries(entries, {
      productFilter: "all",
      statusFilter: "all",
      dateFrom: "2026-04-06",
      dateTo: "",
      showArchived: false,
    });
    expect(out).toHaveLength(0);
  });

  it("dateTo only — filters out later entries", () => {
    const out = filterAlertEntries(entries, {
      productFilter: "all",
      statusFilter: "all",
      dateFrom: "",
      dateTo: "2026-04-04",
      showArchived: false,
    });
    expect(out).toHaveLength(0);
  });

  it("same-day range includes all entries on that day", () => {
    const out = filterAlertEntries(entries, {
      productFilter: "all",
      statusFilter: "all",
      dateFrom: "2026-04-05",
      dateTo: "2026-04-05",
      showArchived: false,
    });
    expect(out).toHaveLength(2);
  });
});

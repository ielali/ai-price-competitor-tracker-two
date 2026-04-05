import { describe, it, expect, beforeEach } from "vitest";
import { useAlertHistoryStore } from "@/stores/alert-history-store";
import { ALERT_HISTORY_SEED } from "@/lib/alert-history-seed";

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

describe("useAlertHistoryStore", () => {
  beforeEach(() => {
    resetStore();
  });

  it("markAsRead moves new to acknowledged for given ids", () => {
    const id = ALERT_HISTORY_SEED.find((e) => e.status === "new")!.id;
    useAlertHistoryStore.getState().markAsRead([id]);
    const updated = useAlertHistoryStore
      .getState()
      .entries.find((e) => e.id === id)!;
    expect(updated.status).toBe("acknowledged");
  });

  it("archive sets archived flag", () => {
    const id = ALERT_HISTORY_SEED.find((e) => !e.archived)!.id;
    useAlertHistoryStore.getState().archive([id]);
    const updated = useAlertHistoryStore
      .getState()
      .entries.find((e) => e.id === id)!;
    expect(updated.archived).toBe(true);
  });

  it("toggleSelected adds and removes ids", () => {
    const id = ALERT_HISTORY_SEED[0].id;
    useAlertHistoryStore.getState().toggleSelected(id);
    expect(useAlertHistoryStore.getState().selectedIds).toContain(id);
    useAlertHistoryStore.getState().toggleSelected(id);
    expect(useAlertHistoryStore.getState().selectedIds).not.toContain(id);
  });
});

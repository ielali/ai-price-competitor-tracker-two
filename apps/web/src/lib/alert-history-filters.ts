import type { AlertHistoryEntry, AlertStatusFilter } from "./alert-history-types";

export interface AlertHistoryFilterState {
  productFilter: string;
  statusFilter: AlertStatusFilter;
  dateFrom: string;
  dateTo: string;
  showArchived: boolean;
}

function entryInDateRange(
  entry: AlertHistoryEntry,
  dateFrom: string,
  dateTo: string
) {
  if (!dateFrom && !dateTo) return true;
  const t = new Date(entry.occurredAt).getTime();
  if (dateFrom) {
    const start = new Date(dateFrom + "T00:00:00.000Z").getTime();
    if (t < start) return false;
  }
  if (dateTo) {
    const end = new Date(dateTo + "T23:59:59.999Z").getTime();
    if (t > end) return false;
  }
  return true;
}

export function filterAlertEntries(
  entries: AlertHistoryEntry[],
  f: AlertHistoryFilterState
) {
  return entries.filter((e) => {
    if (!f.showArchived && e.archived) return false;
    if (f.productFilter !== "all" && e.productId !== f.productFilter) {
      return false;
    }
    if (f.statusFilter !== "all" && e.status !== f.statusFilter) {
      return false;
    }
    return entryInDateRange(e, f.dateFrom, f.dateTo);
  });
}

export function countUnreadAlerts(entries: AlertHistoryEntry[]) {
  return entries.filter((e) => !e.archived && e.status === "new").length;
}

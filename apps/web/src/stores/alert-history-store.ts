import { create } from "zustand";
import { ALERT_HISTORY_SEED } from "@/lib/alert-history-seed";
import type {
  AlertHistoryEntry,
  AlertStatusFilter,
} from "@/lib/alert-history-types";

interface AlertHistoryState {
  entries: AlertHistoryEntry[];
  selectedIds: string[];
  productFilter: string;
  statusFilter: AlertStatusFilter;
  dateFrom: string;
  dateTo: string;
  showArchived: boolean;
  setProductFilter: (productId: string) => void;
  setStatusFilter: (status: AlertStatusFilter) => void;
  setDateFrom: (value: string) => void;
  setDateTo: (value: string) => void;
  setShowArchived: (show: boolean) => void;
  toggleSelected: (id: string) => void;
  setSelectedForVisible: (ids: string[], selected: boolean) => void;
  clearSelection: () => void;
  markAsRead: (ids: string[]) => void;
  markResolved: (ids: string[]) => void;
  archive: (ids: string[]) => void;
}

export const useAlertHistoryStore = create<AlertHistoryState>((set) => ({
  entries: ALERT_HISTORY_SEED,
  selectedIds: [],
  productFilter: "all",
  statusFilter: "all",
  dateFrom: "",
  dateTo: "",
  showArchived: false,

  setProductFilter: (productId) => set({ productFilter: productId }),
  setStatusFilter: (status) => set({ statusFilter: status }),
  setDateFrom: (value) => set({ dateFrom: value }),
  setDateTo: (value) => set({ dateTo: value }),
  setShowArchived: (show) => set({ showArchived: show }),

  toggleSelected: (id) =>
    set((s) => ({
      selectedIds: s.selectedIds.includes(id)
        ? s.selectedIds.filter((x) => x !== id)
        : [...s.selectedIds, id],
    })),

  setSelectedForVisible: (ids, selected) =>
    set((s) => {
      const setIds = new Set(ids);
      if (selected) {
        const merged = new Set([...s.selectedIds, ...ids]);
        return { selectedIds: [...merged] };
      }
      return {
        selectedIds: s.selectedIds.filter((id) => !setIds.has(id)),
      };
    }),

  clearSelection: () => set({ selectedIds: [] }),

  markAsRead: (ids) =>
    set((s) => ({
      entries: s.entries.map((e) =>
        ids.includes(e.id) && e.status === "new"
          ? { ...e, status: "acknowledged" as const }
          : e
      ),
      selectedIds: [],
    })),

  markResolved: (ids) =>
    set((s) => ({
      entries: s.entries.map((e) =>
        ids.includes(e.id) ? { ...e, status: "resolved" as const } : e
      ),
      selectedIds: [],
    })),

  archive: (ids) =>
    set((s) => ({
      entries: s.entries.map((e) =>
        ids.includes(e.id) ? { ...e, archived: true } : e
      ),
      selectedIds: [],
    })),
}));

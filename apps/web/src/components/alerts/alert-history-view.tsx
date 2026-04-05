"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { filterAlertEntries } from "@/lib/alert-history-filters";
import type { AlertStatusFilter } from "@/lib/alert-history-types";
import { useAlertHistoryStore } from "@/stores/alert-history-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertStatusBadge } from "./alert-status-badge";

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function AlertHistoryView() {
  const router = useRouter();
  const entries = useAlertHistoryStore((s) => s.entries);
  const productFilter = useAlertHistoryStore((s) => s.productFilter);
  const statusFilter = useAlertHistoryStore((s) => s.statusFilter);
  const dateFrom = useAlertHistoryStore((s) => s.dateFrom);
  const dateTo = useAlertHistoryStore((s) => s.dateTo);
  const showArchived = useAlertHistoryStore((s) => s.showArchived);
  const selectedIds = useAlertHistoryStore((s) => s.selectedIds);
  const setProductFilter = useAlertHistoryStore((s) => s.setProductFilter);
  const setStatusFilter = useAlertHistoryStore((s) => s.setStatusFilter);
  const setDateFrom = useAlertHistoryStore((s) => s.setDateFrom);
  const setDateTo = useAlertHistoryStore((s) => s.setDateTo);
  const setShowArchived = useAlertHistoryStore((s) => s.setShowArchived);
  const toggleSelected = useAlertHistoryStore((s) => s.toggleSelected);
  const setSelectedForVisible = useAlertHistoryStore(
    (s) => s.setSelectedForVisible
  );
  const markAsRead = useAlertHistoryStore((s) => s.markAsRead);
  const archive = useAlertHistoryStore((s) => s.archive);

  const productOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of entries) {
      map.set(e.productId, e.productName);
    }
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [entries]);

  const filtered = useMemo(
    () =>
      filterAlertEntries(entries, {
        productFilter,
        statusFilter,
        dateFrom,
        dateTo,
        showArchived,
      }),
    [entries, productFilter, statusFilter, dateFrom, dateTo, showArchived]
  );

  const sorted = useMemo(
    () =>
      [...filtered].sort(
        (a, b) =>
          new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
      ),
    [filtered]
  );

  const visibleIds = useMemo(() => sorted.map((r) => r.id), [sorted]);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const bulkTargetIds =
    selectedIds.length > 0
      ? selectedIds.filter((id) => visibleIds.includes(id))
      : [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Alerts</h1>
        <p className="mt-2 text-muted-foreground">
          Triggered alerts and delivery activity. Data is local for now until
          the notification API is connected.
        </p>
      </header>

      <section
        aria-label="Filters"
        className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 md:flex-row md:flex-wrap md:items-end"
      >
        <div className="flex min-w-[10rem] flex-1 flex-col gap-1">
          <label htmlFor="filter-product" className="text-sm font-medium">
            Product
          </label>
          <select
            id="filter-product"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
          >
            <option value="all">All products</option>
            {productOptions.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex min-w-[10rem] flex-1 flex-col gap-1">
          <label htmlFor="filter-status" className="text-sm font-medium">
            Status
          </label>
          <select
            id="filter-status"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as AlertStatusFilter)
            }
          >
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div className="flex flex-1 flex-col gap-1 md:min-w-[8rem]">
          <label htmlFor="filter-from" className="text-sm font-medium">
            From
          </label>
          <Input
            id="filter-from"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>

        <div className="flex flex-1 flex-col gap-1 md:min-w-[8rem]">
          <label htmlFor="filter-to" className="text-sm font-medium">
            To
          </label>
          <Input
            id="filter-to"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm md:pb-2">
          <input
            type="checkbox"
            className="size-4 rounded border-input"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
          />
          Show archived
        </label>
      </section>

      {bulkTargetIds.length > 0 ? (
        <div
          className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2"
          role="toolbar"
          aria-label="Bulk actions"
        >
          <span className="text-sm text-muted-foreground">
            {bulkTargetIds.length} selected
          </span>
          <Button
            size="sm"
            variant="secondary"
            type="button"
            onClick={() => markAsRead(bulkTargetIds)}
          >
            Mark as read
          </Button>
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={() => archive(bulkTargetIds)}
          >
            Archive
          </Button>
        </div>
      ) : null}

      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <span className="sr-only">Select</span>
                <input
                  type="checkbox"
                  className="size-4 rounded border-input"
                  checked={allVisibleSelected}
                  onChange={() =>
                    setSelectedForVisible(visibleIds, !allVisibleSelected)
                  }
                  aria-label="Select all visible alerts"
                />
              </TableHead>
              <TableHead>Date / time</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Trigger</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No alerts match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/products/${row.productId}`)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="size-4 rounded border-input"
                      checked={selectedIds.includes(row.id)}
                      onChange={() => toggleSelected(row.id)}
                      aria-label={`Select alert ${row.productName}`}
                    />
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDateTime(row.occurredAt)}
                  </TableCell>
                  <TableCell className="font-medium">{row.productName}</TableCell>
                  <TableCell className="max-w-[14rem] text-muted-foreground">
                    {row.triggerCondition}
                  </TableCell>
                  <TableCell>{row.channel}</TableCell>
                  <TableCell>
                    <AlertStatusBadge status={row.status} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

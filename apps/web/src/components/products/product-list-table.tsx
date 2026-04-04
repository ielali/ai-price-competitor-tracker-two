"use client";

import * as React from "react";
import Link from "next/link";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Minus,
  Package,
  Pencil,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import type { Product } from "@/lib/products/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const VIRTUAL_THRESHOLD = 100;

const COLUMN_LABEL: Record<string, string> = {
  name: "Product Name",
  ownPrice: "Own Price",
  competitorCount: "Competitors",
  lastUpdated: "Last Updated",
  priceTrend: "Price Trend",
  status: "Status",
};

function formatMoney(value: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function TrendCell({ trend }: { trend: Product["priceTrend"] }) {
  if (trend === "up") {
    return (
      <span className="inline-flex items-center gap-1 text-price-up">
        <TrendingUp className="h-4 w-4 shrink-0" aria-hidden />
        <span>Up</span>
      </span>
    );
  }
  if (trend === "down") {
    return (
      <span className="inline-flex items-center gap-1 text-price-down">
        <TrendingDown className="h-4 w-4 shrink-0" aria-hidden />
        <span>Down</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-stable">
      <Minus className="h-4 w-4 shrink-0" aria-hidden />
      <span>Stable</span>
    </span>
  );
}

function StatusBadge({ status }: { status: Product["status"] }) {
  const label =
    status === "active" ? "Active" : status === "paused" ? "Paused" : "Error";
  const className =
    status === "active"
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
      : status === "paused"
        ? "bg-muted text-muted-foreground"
        : "bg-destructive/15 text-destructive";
  return (
    <span
      className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", className)}
    >
      {label}
    </span>
  );
}

export interface ProductListTableProps {
  initialProducts: Product[];
}

export function ProductListTable({ initialProducts }: ProductListTableProps) {
  const [data, setData] = React.useState<Product[]>(initialProducts);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const savedPageSizeRef = React.useRef(25);

  const [deleteTarget, setDeleteTarget] = React.useState<Product | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);
  const [sortAnnouncement, setSortAnnouncement] = React.useState("");

  const categories = React.useMemo(() => {
    const s = new Set(data.map((p) => p.category));
    return Array.from(s).sort();
  }, [data]);

  const columns = React.useMemo<ColumnDef<Product>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            className="h-4 w-4 rounded border border-input accent-primary"
            checked={table.getIsAllPageRowsSelected()}
            ref={(el) => {
              if (el) {
                el.indeterminate = table.getIsSomePageRowsSelected();
              }
            }}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            aria-label="Select all rows on this page"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="h-4 w-4 rounded border border-input accent-primary"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
            aria-label={`Select ${row.original.name}`}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "name",
        header: "Product Name",
        enableGlobalFilter: true,
      },
      {
        accessorKey: "ownPrice",
        header: "Own Price",
        cell: ({ row }) => (
          <span className="font-tabular text-user-price">
            {formatMoney(row.original.ownPrice, row.original.currency)}
          </span>
        ),
        sortingFn: "basic",
      },
      {
        accessorKey: "competitorCount",
        header: "# Competitors",
        cell: ({ getValue }) => (
          <span className="font-tabular">{getValue<number>()}</span>
        ),
      },
      {
        accessorKey: "lastUpdated",
        header: "Last Updated",
        cell: ({ row }) => formatDate(row.original.lastUpdated),
        sortingFn: (a, b) =>
          new Date(a.original.lastUpdated).getTime() -
          new Date(b.original.lastUpdated).getTime(),
      },
      {
        accessorKey: "priceTrend",
        header: "Price Trend",
        cell: ({ row }) => <TrendCell trend={row.original.priceTrend} />,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
        filterFn: (row, columnId, filterValue) => {
          if (filterValue == null || filterValue === "") return true;
          return row.getValue(columnId) === filterValue;
        },
      },
      {
        accessorKey: "category",
        header: () => null,
        cell: () => null,
        filterFn: (row, columnId, filterValue) => {
          if (filterValue == null || filterValue === "") return true;
          return row.getValue(columnId) === filterValue;
        },
        enableGlobalFilter: false,
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Row actions</span>,
        enableSorting: false,
        cell: ({ row }) => (
          <div
            className={cn(
              "flex justify-end gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
            )}
          >
            <Button variant="ghost" size="sm" className="h-8 px-2" asChild>
              <Link href={`/products/${row.original.id}`}>View</Link>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link href={`/products/${row.original.id}/edit`} aria-label={`Edit ${row.original.name}`}>
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              aria-label={`Delete ${row.original.name}`}
              onClick={() => setDeleteTarget(row.original)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const categoryFilter = (columnFilters.find((f) => f.id === "category")?.value as string) ?? "";
  const statusFilter = (columnFilters.find((f) => f.id === "status")?.value as string) ?? "";

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      rowSelection,
      pagination,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getRowId: (row) => row.id,
    globalFilterFn: (row, _columnId, filterValue) => {
      const q = String(filterValue ?? "").toLowerCase().trim();
      if (!q) return true;
      const name = row.original.name.toLowerCase();
      const sku = row.original.sku.toLowerCase();
      return name.includes(q) || sku.includes(q);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
    initialState: {
      columnVisibility: { category: false },
    },
  });

  const filteredRows = table.getFilteredRowModel().rows;
  const filteredCount = filteredRows.length;
  const useVirtual = filteredCount > VIRTUAL_THRESHOLD;

  const pagedRows = table.getRowModel().rows;

  const tableContainerRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: useVirtual ? pagedRows.length : 0,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 52,
    overscan: 12,
    enabled: useVirtual,
  });

  React.useEffect(() => {
    if (filteredCount > VIRTUAL_THRESHOLD) {
      setPagination((p) => {
        if (p.pageIndex === 0 && p.pageSize === filteredCount) return p;
        if (p.pageSize <= VIRTUAL_THRESHOLD) {
          savedPageSizeRef.current = p.pageSize;
        }
        return { pageIndex: 0, pageSize: filteredCount };
      });
    } else {
      setPagination((p) => {
        if (p.pageSize > VIRTUAL_THRESHOLD) {
          return { pageIndex: 0, pageSize: savedPageSizeRef.current };
        }
        return p;
      });
    }
  }, [filteredCount]);

  React.useEffect(() => {
    const s = sorting[0];
    if (!s) {
      setSortAnnouncement("");
      return;
    }
    const label = COLUMN_LABEL[s.id] ?? s.id;
    const dir = s.desc ? "descending" : "ascending";
    setSortAnnouncement(`Sorted by ${label}, ${dir}`);
  }, [sorting]);

  const selectedIds = Object.keys(rowSelection).filter((k) => rowSelection[k]);

  const removeProducts = (ids: string[]) => {
    setData((prev) => prev.filter((p) => !ids.includes(p.id)));
    setRowSelection({});
    setDeleteTarget(null);
    setBulkDeleteOpen(false);
  };

  const pauseSelected = () => {
    const idSet = new Set(selectedIds);
    setData((prev) =>
      prev.map((p) => (idSet.has(p.id) ? { ...p, status: "paused" as const } : p))
    );
    setRowSelection({});
  };

  const headerGroups = table.getHeaderGroups();
  const colCount = headerGroups[0]?.headers.length ?? 0;

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 px-6 py-16 text-center">
        <Package className="h-14 w-14 text-muted-foreground" aria-hidden />
        <h2 className="mt-4 text-lg font-semibold">Track your first product</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Add a product to start monitoring competitor prices and trends across your catalog.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/products/add">Add product</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div aria-live="polite" className="sr-only" role="status">
        {sortAnnouncement}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="product-search" className="sr-only">
            Search by product name or SKU
          </label>
          <Input
            id="product-search"
            placeholder="Search name or SKU…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-md"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <div>
            <label htmlFor="filter-category" className="mb-1 block text-xs text-muted-foreground">
              Category
            </label>
            <select
              id="filter-category"
              className={cn(
                "h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
              value={categoryFilter}
              onChange={(e) => {
                const v = e.target.value;
                setColumnFilters((prev) => {
                  const rest = prev.filter((f) => f.id !== "category");
                  return v ? [...rest, { id: "category", value: v }] : rest;
                });
              }}
            >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label htmlFor="filter-status" className="mb-1 block text-xs text-muted-foreground">
              Status
            </label>
            <select
              id="filter-status"
              className={cn(
                "h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
              value={statusFilter}
              onChange={(e) => {
                const v = e.target.value;
                setColumnFilters((prev) => {
                  const rest = prev.filter((f) => f.id !== "status");
                  return v ? [...rest, { id: "status", value: v }] : rest;
                });
              }}
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div
          className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm"
          role="toolbar"
          aria-label="Bulk actions"
        >
          <span className="text-muted-foreground">{selectedIds.length} selected</span>
          <Button size="sm" variant="secondary" onClick={pauseSelected}>
            Pause tracking
          </Button>
          <Button size="sm" variant="destructive" onClick={() => setBulkDeleteOpen(true)}>
            Delete
          </Button>
        </div>
      )}

      {filteredCount === 0 && (
        <div className="rounded-lg border border-dashed bg-muted/20 px-6 py-10 text-center text-sm text-muted-foreground">
          No products match your filters.{" "}
          <button
            type="button"
            className="font-medium text-primary underline-offset-4 hover:underline"
            onClick={() => {
              setGlobalFilter("");
              setColumnFilters([]);
            }}
          >
            Clear filters
          </button>
        </div>
      )}

      {filteredCount > 0 && (
        <>
          {useVirtual && (
            <p className="text-sm text-muted-foreground" role="status">
              Showing all {filteredCount} matching products in a scrollable list (virtualized).
            </p>
          )}
          <div
            ref={useVirtual ? tableContainerRef : undefined}
            className={cn(useVirtual && "max-h-[min(70vh,540px)] overflow-auto rounded-md border")}
          >
            <Table>
              <TableHeader>
                {headerGroups.map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const sorted = header.column.getIsSorted();
                      const ariaSort =
                        sorted === "asc"
                          ? "ascending"
                          : sorted === "desc"
                            ? "descending"
                            : "none";
                      return (
                        <TableHead
                          key={header.id}
                          scope="col"
                          aria-sort={header.column.getCanSort() ? ariaSort : undefined}
                        >
                          {header.column.getCanSort() ? (
                            <button
                              type="button"
                              className={cn(
                                "inline-flex items-center gap-1 font-medium hover:text-foreground",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                              )}
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {sorted === "asc" ? (
                                <ArrowUp className="h-4 w-4" aria-hidden />
                              ) : sorted === "desc" ? (
                                <ArrowDown className="h-4 w-4" aria-hidden />
                              ) : (
                                <ArrowUpDown className="h-4 w-4 opacity-40" aria-hidden />
                              )}
                            </button>
                          ) : (
                            flexRender(header.column.columnDef.header, header.getContext())
                          )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {useVirtual ? (
                  <>
                    {rowVirtualizer.getVirtualItems().length > 0 && (
                      <>
                        {rowVirtualizer.getVirtualItems()[0]!.start > 0 && (
                          <TableRow className="hover:bg-transparent">
                            <TableCell
                              colSpan={colCount}
                              className="p-0"
                              style={{
                                height: `${rowVirtualizer.getVirtualItems()[0]!.start}px`,
                              }}
                            />
                          </TableRow>
                        )}
                        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                          const row = pagedRows[virtualRow.index]!;
                          return (
                            <TableRow
                              key={row.id}
                              data-state={row.getIsSelected() ? "selected" : undefined}
                              className="group"
                            >
                              {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id}>
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                              ))}
                            </TableRow>
                          );
                        })}
                        {(() => {
                          const items = rowVirtualizer.getVirtualItems();
                          const last = items[items.length - 1];
                          if (!last) return null;
                          const bottom =
                            rowVirtualizer.getTotalSize() - last.end;
                          if (bottom <= 0) return null;
                          return (
                            <TableRow className="hover:bg-transparent">
                              <TableCell
                                colSpan={colCount}
                                className="p-0"
                                style={{ height: `${bottom}px` }}
                              />
                            </TableRow>
                          );
                        })()}
                      </>
                    )}
                  </>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() ? "selected" : undefined}
                      className="group"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {!useVirtual && filteredCount > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Rows per page</span>
            <select
              className={cn(
                "h-9 rounded-md border border-input bg-background px-2 text-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
              aria-label="Rows per page"
              value={pagination.pageSize}
              onChange={(e) => {
                const size = Number(e.target.value);
                savedPageSizeRef.current = size;
                table.setPageSize(size);
              }}
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete product?</DialogTitle>
            <DialogDescription>
              Delete {deleteTarget?.name ?? ""}? This removes tracked pricing data for this product.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && removeProducts([deleteTarget.id])}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {selectedIds.length} products?</DialogTitle>
            <DialogDescription>
              This removes the selected products and their tracked pricing data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => removeProducts(selectedIds)}>
              Delete all
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

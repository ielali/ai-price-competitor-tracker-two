export type DashboardStat = {
  id: string;
  label: string;
  value: string;
  hint?: string;
};

export type DashboardAlertRow = {
  id: string;
  title: string;
  productName: string;
  severity: "critical" | "warning" | "info";
  occurredAtLabel: string;
};

export type DashboardOverview = {
  stats: DashboardStat[];
  recentAlerts: DashboardAlertRow[];
  lastFullSyncLabel: string;
};

/**
 * Demo overview for the dashboard home until backend APIs exist.
 * Centralized so snapshots and tests stay stable and the page stays thin.
 */
export function getDashboardOverview(): DashboardOverview {
  return {
    stats: [
      {
        id: "products",
        label: "Tracked products",
        value: "24",
        hint: "Across 6 categories",
      },
      {
        id: "competitors",
        label: "Active competitor sources",
        value: "18",
        hint: "16 healthy · 2 degraded",
      },
      {
        id: "alerts",
        label: "Open alerts",
        value: "3",
        hint: "1 critical · 2 warning",
      },
      {
        id: "scrapes",
        label: "Scrapes (24h)",
        value: "412",
        hint: "98.3% success rate",
      },
    ],
    recentAlerts: [
      {
        id: "a1",
        title: "Price dropped below floor",
        productName: "Pro Wireless Headphones",
        severity: "critical",
        occurredAtLabel: "12 min ago",
      },
      {
        id: "a2",
        title: "Competitor listing unavailable",
        productName: "USB-C Hub 7-in-1",
        severity: "warning",
        occurredAtLabel: "1 hr ago",
      },
      {
        id: "a3",
        title: "New lowest price in category",
        productName: "Ergo Mesh Chair",
        severity: "info",
        occurredAtLabel: "3 hr ago",
      },
    ],
    lastFullSyncLabel: "Today at 9:42 AM UTC",
  };
}

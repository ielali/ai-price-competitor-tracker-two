import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Users,
  Bell,
  FileBarChart,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDashboardOverview } from "@/lib/dashboard-overview";
import { cn } from "@/lib/utils";

const quickLinks = [
  {
    href: "/products",
    label: "Products",
    description: "Manage SKUs and watchlists",
    icon: Package,
  },
  {
    href: "/competitors",
    label: "Competitors",
    description: "Sources and scrape health",
    icon: Users,
  },
  {
    href: "/alerts",
    label: "Alerts",
    description: "Rules and notifications",
    icon: Bell,
  },
  {
    href: "/reports",
    label: "Reports",
    description: "Exports and summaries",
    icon: FileBarChart,
  },
] as const;

function severityClass(severity: "critical" | "warning" | "info") {
  switch (severity) {
    case "critical":
      return "bg-destructive/15 text-destructive";
    case "warning":
      return "bg-anomaly/15 text-anomaly";
    default:
      return "bg-secondary text-secondary-foreground";
  }
}

export function DashboardHome() {
  const overview = getDashboardOverview();

  return (
    <div className="space-y-10">
      <header className="space-y-1">
        <div className="flex items-center gap-2 text-muted-foreground">
          <LayoutDashboard className="size-5 shrink-0" aria-hidden />
          <span className="text-sm font-medium">Overview</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Snapshot of competitor coverage, scrape health, and alerts. Connect
          live data when APIs are available; figures below illustrate the
          experience.
        </p>
        <p className="text-xs text-muted-foreground">
          Last full sync:{" "}
          <span className="font-tabular text-foreground">
            {overview.lastFullSyncLabel}
          </span>
        </p>
      </header>

      <section aria-labelledby="dashboard-stats-heading">
        <h2 id="dashboard-stats-heading" className="sr-only">
          Key metrics
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {overview.stats.map((stat) => (
            <li key={stat.id}>
              <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-2 font-tabular text-3xl font-semibold tracking-tight text-card-foreground">
                  {stat.value}
                </p>
                {stat.hint ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {stat.hint}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section
        className="grid gap-6 lg:grid-cols-3"
        aria-labelledby="dashboard-activity-heading"
      >
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <h2
              id="dashboard-activity-heading"
              className="text-lg font-semibold tracking-tight"
            >
              Recent alerts
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/alerts" className="gap-1">
                View all
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
          <div className="mt-3 rounded-lg border border-border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Alert</TableHead>
                  <TableHead scope="col">Product</TableHead>
                  <TableHead scope="col">Severity</TableHead>
                  <TableHead scope="col" className="text-right">
                    When
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overview.recentAlerts.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.title}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.productName}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex rounded-md px-2 py-0.5 text-xs font-medium capitalize",
                          severityClass(row.severity)
                        )}
                      >
                        {row.severity}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-tabular text-muted-foreground">
                      {row.occurredAtLabel}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold tracking-tight">Quick links</h2>
          <ul className="mt-3 space-y-3">
            {quickLinks.map(({ href, label, description, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex gap-3 rounded-lg border border-border bg-card p-3 shadow-sm transition-colors hover:bg-accent/40"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-medium text-card-foreground">
                      {label}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {description}
                    </span>
                  </span>
                  <ArrowRight
                    className="ml-auto size-4 shrink-0 self-center text-muted-foreground"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

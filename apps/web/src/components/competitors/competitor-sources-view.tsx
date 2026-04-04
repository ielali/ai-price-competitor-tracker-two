import {
  classifySourceHealth,
  summarizeSourcesHealth,
  type CompetitorSource,
} from "@/lib/competitor-sources";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SourceHealthBadge } from "./source-health-badge";

function formatLastSuccess(iso: string | null): string {
  if (!iso) {
    return "Never";
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return "—";
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

function truncateUrl(url: string, max = 48): string {
  if (url.length <= max) {
    return url;
  }
  return `${url.slice(0, max - 1)}…`;
}

export function CompetitorSourcesView({ sources }: { sources: CompetitorSource[] }) {
  const summary = summarizeSourcesHealth(sources);

  return (
    <div className="space-y-8">
      <section aria-labelledby="sources-health-summary-heading">
        <h2
          id="sources-health-summary-heading"
          className="sr-only"
        >
          Scraping health summary
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">
              Sources tracked
            </p>
            <p
              className="mt-1 font-tabular text-2xl font-semibold tracking-tight"
              data-testid="tracked-source-count"
            >
              {summary.total}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">
              Avg. success (7d)
            </p>
            <p className="mt-1 font-tabular text-2xl font-semibold tracking-tight">
              {summary.total === 0 ? "—" : `${summary.aggregateSuccessRate7dPct}%`}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">
              Healthy
            </p>
            <p className="mt-1 font-tabular text-2xl font-semibold tracking-tight text-emerald-700 dark:text-emerald-300">
              {summary.healthy}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">
              Needs attention
            </p>
            <p className="mt-1 font-tabular text-2xl font-semibold tracking-tight">
              <span className="text-amber-700 dark:text-amber-300">
                {summary.degraded}
              </span>
              <span className="mx-1 text-muted-foreground">/</span>
              <span className="text-destructive">{summary.critical}</span>
              <span className="sr-only">
                {summary.degraded} degraded, {summary.critical} critical
              </span>
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="sources-table-heading">
        <h2
          id="sources-table-heading"
          className="mb-3 text-lg font-semibold tracking-tight"
        >
          Competitor sources
        </h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Label</TableHead>
              <TableHead className="hidden md:table-cell">Platform</TableHead>
              <TableHead className="hidden lg:table-cell">URL</TableHead>
              <TableHead className="text-right font-tabular">7d success</TableHead>
              <TableHead className="hidden sm:table-cell">Last success</TableHead>
              <TableHead>Health</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sources.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No competitor sources yet. Add a source to start monitoring.
                </TableCell>
              </TableRow>
            ) : (
              sources.map((row) => {
                const health = classifySourceHealth(
                  row.successRate7dPct,
                  row.lastSuccessAt,
                );
                return (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.label}</TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {row.platform}
                    </TableCell>
                    <TableCell className="hidden max-w-[min(28rem,40vw)] lg:table-cell">
                      <a
                        href={row.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <span className="break-all">{truncateUrl(row.url)}</span>
                      </a>
                    </TableCell>
                    <TableCell className="text-right font-tabular">
                      {row.successRate7dPct}%
                    </TableCell>
                    <TableCell className="hidden font-tabular text-muted-foreground sm:table-cell">
                      {formatLastSuccess(row.lastSuccessAt)}
                    </TableCell>
                    <TableCell>
                      <SourceHealthBadge status={health} />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}

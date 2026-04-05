import type {
  ScrapingJobStatus,
  ScrapingStatusPayload,
} from "@/lib/scraping-status";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const statusStyles: Record<ScrapingJobStatus, string> = {
  queued: "bg-secondary text-secondary-foreground",
  active: "bg-primary/10 text-primary",
  completed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  failed: "bg-destructive/10 text-destructive",
};

const statusLabels: Record<ScrapingJobStatus, string> = {
  queued: "Queued",
  active: "Active",
  completed: "Completed",
  failed: "Failed",
};

function formatStatus(status: ScrapingJobStatus) {
  return statusLabels[status];
}

function formatWhen(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

interface ScrapingStatusViewProps {
  data: ScrapingStatusPayload;
}

export function ScrapingStatusView({ data }: ScrapingStatusViewProps) {
  const summary = [
    { label: "Queued", value: data.counts.queued },
    { label: "Active", value: data.counts.active },
    { label: "Completed", value: data.counts.completed },
    { label: "Failed", value: data.counts.failed },
  ] as const;

  return (
    <section
      aria-labelledby="scraping-status-heading"
      className="space-y-6 rounded-lg border border-border bg-card p-6 shadow-sm"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="scraping-status-heading"
            className="text-lg font-semibold tracking-tight"
          >
            Scraping activity
          </h2>
          <p className="text-sm text-muted-foreground">
            Live overview of automated price checks (demo dataset until the
            queue is connected).
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Updated{" "}
          <time dateTime={data.generatedAt}>{formatWhen(data.generatedAt)}</time>
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {summary.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-border bg-background/60 px-4 py-3"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {item.label}
            </p>
            <p className="mt-1 font-tabular text-2xl font-semibold">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-foreground">
          Recent jobs
        </h3>
        <Table>
          <caption className="sr-only">
            Recent scraping jobs with status and last update time
          </caption>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Job</TableHead>
              <TableHead scope="col">Status</TableHead>
              <TableHead scope="col">Source</TableHead>
              <TableHead scope="col" className="text-right">
                Last update
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.recentJobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-mono text-xs">{job.id}</TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                      statusStyles[job.status],
                    )}
                  >
                    {formatStatus(job.status)}
                  </span>
                </TableCell>
                <TableCell className="max-w-[220px] truncate">
                  {job.sourceLabel}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  <time dateTime={job.updatedAt}>
                    {formatWhen(job.updatedAt)}
                  </time>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

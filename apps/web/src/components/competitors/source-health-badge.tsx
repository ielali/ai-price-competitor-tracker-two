import type { SourceHealth } from "@/lib/competitor-sources";

const label: Record<SourceHealth, string> = {
  healthy: "Healthy",
  degraded: "Degraded",
  critical: "Critical",
};

const className: Record<SourceHealth, string> = {
  healthy:
    "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 ring-1 ring-emerald-500/30",
  degraded:
    "bg-amber-500/15 text-amber-900 dark:text-amber-100 ring-1 ring-amber-500/35",
  critical:
    "bg-destructive/15 text-destructive ring-1 ring-destructive/40",
};

export function SourceHealthBadge({ status }: { status: SourceHealth }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${className[status]}`}
    >
      {label[status]}
    </span>
  );
}

import { cn } from "@/lib/utils";
import type { AlertStatus } from "@/lib/alert-history-types";

const styles: Record<AlertStatus, string> = {
  new: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  acknowledged:
    "bg-yellow-100 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-200",
  resolved:
    "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
};

const labels: Record<AlertStatus, string> = {
  new: "New",
  acknowledged: "Acknowledged",
  resolved: "Resolved",
};

export function AlertStatusBadge({ status }: { status: AlertStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[status]
      )}
    >
      {labels[status]}
    </span>
  );
}

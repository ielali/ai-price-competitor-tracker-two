export type AlertConditionType =
  | "price_drop_percent"
  | "price_below"
  | "competitor_undercuts";

export interface AlertRule {
  id: string;
  name: string;
  enabled: boolean;
  conditionType: AlertConditionType;
  /** Unit depends on condition: percent, USD, or percent (undercut). */
  threshold: number;
  productScope: "all" | "specific";
  /** When scope is specific, human-readable product name until catalog exists. */
  productLabel: string;
  /** Minimum hours between repeated notifications for the same rule. */
  cooldownHours: number;
  createdAt: string;
}

export const ALERT_CONDITION_OPTIONS: {
  value: AlertConditionType;
  label: string;
  thresholdHint: string;
}[] = [
  {
    value: "price_drop_percent",
    label: "Price drops by (%)",
    thresholdHint: "Percent change vs. previous snapshot",
  },
  {
    value: "price_below",
    label: "Our price below ($)",
    thresholdHint: "Trigger when our listed price falls under this amount",
  },
  {
    value: "competitor_undercuts",
    label: "Competitor undercuts us (%)",
    thresholdHint: "When competitor price is lower by at least this percent",
  },
];

export function conditionTypeLabel(type: AlertConditionType): string {
  return (
    ALERT_CONDITION_OPTIONS.find((o) => o.value === type)?.label ?? type
  );
}

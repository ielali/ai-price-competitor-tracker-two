export type AlertStatus = "new" | "acknowledged" | "resolved";

export interface AlertHistoryEntry {
  id: string;
  occurredAt: string;
  productId: string;
  productName: string;
  triggerCondition: string;
  channel: string;
  status: AlertStatus;
  archived: boolean;
}

export type AlertStatusFilter = "all" | AlertStatus;

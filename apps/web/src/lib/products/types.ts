export type ProductStatus = "active" | "paused" | "error";

export type PriceTrend = "up" | "down" | "stable";

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  ownPrice: number;
  currency: string;
  competitorCount: number;
  lastUpdated: string;
  priceTrend: PriceTrend;
  status: ProductStatus;
}

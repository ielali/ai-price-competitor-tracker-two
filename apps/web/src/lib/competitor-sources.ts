export type CompetitorPlatform = "Amazon" | "eBay" | "Walmart" | "Shopify" | "Other";

export type SourceHealth = "healthy" | "degraded" | "critical";

export interface CompetitorSource {
  id: string;
  label: string;
  platform: CompetitorPlatform;
  url: string;
  /** Successful scrape percentage over the last 7 days (0–100). */
  successRate7dPct: number;
  /** ISO timestamp of last successful scrape, or null if never succeeded. */
  lastSuccessAt: string | null;
}

export function hoursSince(date: Date, from: Date = new Date()): number {
  return (from.getTime() - date.getTime()) / (60 * 60 * 1000);
}

/**
 * Classifies scraping health from 7-day success rate and last success time.
 * Targets align with product expectations: ≥90% healthy operation, &lt;70% critical.
 */
export function classifySourceHealth(
  successRate7dPct: number,
  lastSuccessAt: string | null,
  now: Date = new Date(),
): SourceHealth {
  if (lastSuccessAt === null) {
    return "critical";
  }
  const last = new Date(lastSuccessAt);
  if (Number.isNaN(last.getTime())) {
    return "critical";
  }

  const h = Math.max(0, hoursSince(last, now));

  if (successRate7dPct < 70 || h >= 72) {
    return "critical";
  }
  if (successRate7dPct < 90 || h >= 24) {
    return "degraded";
  }
  return "healthy";
}

export interface SourcesHealthSummary {
  total: number;
  healthy: number;
  degraded: number;
  critical: number;
  aggregateSuccessRate7dPct: number;
}

export function summarizeSourcesHealth(
  sources: CompetitorSource[],
  now: Date = new Date(),
): SourcesHealthSummary {
  const counts = { healthy: 0, degraded: 0, critical: 0 };
  let rateSum = 0;

  for (const s of sources) {
    const h = classifySourceHealth(s.successRate7dPct, s.lastSuccessAt, now);
    counts[h] += 1;
    rateSum += s.successRate7dPct;
  }

  const total = sources.length;
  return {
    total,
    healthy: counts.healthy,
    degraded: counts.degraded,
    critical: counts.critical,
    aggregateSuccessRate7dPct:
      total === 0 ? 0 : Math.round((rateSum / total) * 10) / 10,
  };
}

/** Seed data for UI until backend APIs exist. */
export const mockCompetitorSources: CompetitorSource[] = [
  {
    id: "src-1",
    label: "Competitor A — Amazon",
    platform: "Amazon",
    url: "https://www.amazon.com/dp/B08N5WRWNW",
    successRate7dPct: 96,
    lastSuccessAt: "2026-04-04T02:15:00.000Z",
  },
  {
    id: "src-2",
    label: "Competitor B — eBay",
    platform: "eBay",
    url: "https://www.ebay.com/itm/example-listing-123",
    successRate7dPct: 88,
    lastSuccessAt: "2026-04-03T18:40:00.000Z",
  },
  {
    id: "src-3",
    label: "Competitor C — Walmart",
    platform: "Walmart",
    url: "https://www.walmart.com/ip/example-product",
    successRate7dPct: 62,
    lastSuccessAt: "2026-04-01T09:00:00.000Z",
  },
  {
    id: "src-4",
    label: "Competitor D — Shopify",
    platform: "Shopify",
    url: "https://example-store.myshopify.com/products/sku-99",
    successRate7dPct: 100,
    lastSuccessAt: "2026-04-04T05:00:00.000Z",
  },
];

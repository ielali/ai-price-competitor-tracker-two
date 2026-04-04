import type { Product, PriceTrend, ProductStatus } from "./types";

const CATEGORIES = ["Electronics", "Home", "Apparel", "Sports", "Beauty"] as const;

const TRENDS: PriceTrend[] = ["up", "down", "stable"];
const STATUSES: ProductStatus[] = ["active", "paused", "error"];

function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Deterministic mock rows for demos and tests (default count = 12). */
export function createMockProducts(count = 12, seed = 42): Product[] {
  const rand = seededRandom(seed);
  const rows: Product[] = [];
  for (let i = 0; i < count; i++) {
    rows.push({
      id: `prod-${seed}-${i + 1}`,
      name: `Sample Product ${i + 1}`,
      sku: `SKU-${1000 + i}`,
      category: CATEGORIES[Math.floor(rand() * CATEGORIES.length)]!,
      ownPrice: Math.round((29.99 + rand() * 470) * 100) / 100,
      currency: "USD",
      competitorCount: Math.floor(rand() * 12),
      lastUpdated: new Date(Date.now() - Math.floor(rand() * 14 * 24 * 60 * 60 * 1000)).toISOString(),
      priceTrend: TRENDS[Math.floor(rand() * TRENDS.length)]!,
      status: STATUSES[Math.floor(rand() * STATUSES.length)]!,
    });
  }
  // Keep first row stable for predictable tests
  if (rows[0]) {
    rows[0].name = "Alpha Test Widget";
    rows[0].sku = "SKU-ALPHA";
    rows[0].status = "active";
    rows[0].category = "Electronics";
  }
  return rows;
}

export function createDefaultMockProducts(): Product[] {
  return createMockProducts(14, 42);
}

/** How the scraper discovered a price string before normalization. */
export type ExtractionMethod =
  | "json-ld-product"
  | "json-ld-offer"
  | "open-graph"
  | "microdata"
  | "data-attribute"
  | "meta-tag";

export type PriceConfidence = "high" | "medium" | "low";

export type RawPriceCandidate = {
  /** Original textual value (may include currency symbol or formatting). */
  raw: string;
  /** Optional ISO 4217 or symbol hint from the page. */
  currencyHint?: string;
  method: ExtractionMethod;
  confidence: PriceConfidence;
};

/**
 * Canonical snapshot for downstream storage (major units as decimal string).
 */
export type NormalizedPrice = {
  /** Non-negative decimal string without grouping separators (e.g. "19.99"). */
  amount: string;
  /** Uppercase ISO 4217 code when known. */
  currency: string;
  /** Extraction method that produced the winning candidate. */
  method: ExtractionMethod;
};

export type {
  ExtractionMethod,
  NormalizedPrice,
  PriceConfidence,
  RawPriceCandidate,
} from "./types";
export { extractRawPriceCandidates } from "./extract";
export {
  normalizePriceCandidate,
  parseMoneyToDecimalString,
  pickBestNormalized,
} from "./normalize";

import { extractRawPriceCandidates } from "./extract";
import { pickBestNormalized } from "./normalize";
import type { NormalizedPrice } from "./types";

/** Full pipeline: HTML in → best normalized price out. */
export function extractNormalizedPrice(html: string): NormalizedPrice | null {
  const raw = extractRawPriceCandidates(html);
  return pickBestNormalized(raw);
}

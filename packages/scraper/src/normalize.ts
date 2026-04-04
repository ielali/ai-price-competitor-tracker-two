import type { NormalizedPrice, RawPriceCandidate } from "./types";

const ISO4217 = new Set([
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CNY",
  "CAD",
  "AUD",
  "CHF",
  "INR",
  "MXN",
  "BRL",
  "SEK",
  "NOK",
  "DKK",
  "PLN",
  "NZD",
  "SGD",
  "HKD",
  "KRW",
  "ZAR",
]);

/** Map common symbols and short tokens to ISO 4217 (fallback when page lacks explicit code). */
const SYMBOL_TO_ISO: Record<string, string> = {
  $: "USD",
  "us$": "USD",
  "€": "EUR",
  "£": "GBP",
  "¥": "JPY",
  "￥": "JPY",
  "₹": "INR",
};

function normalizeCurrencyHint(hint: string | undefined): string | undefined {
  if (!hint) return undefined;
  const t = hint.trim();
  if (!t) return undefined;
  const upper = t.toUpperCase();
  if (ISO4217.has(upper)) return upper;
  const sym = SYMBOL_TO_ISO[t] ?? SYMBOL_TO_ISO[t.toLowerCase()];
  return sym;
}

/**
 * Parse a human-entered money string into a non-negative decimal string.
 * Returns null when no numeric amount can be inferred.
 */
export function parseMoneyToDecimalString(input: string): string | null {
  let s = input.trim();
  if (!s) return null;

  s = s.replace(/\s+/g, " ");

  const isoAtEnd = s.match(/\b([A-Za-z]{3})\s*$/);
  let stripped = s;
  if (isoAtEnd && ISO4217.has(isoAtEnd[1].toUpperCase())) {
    stripped = s.slice(0, isoAtEnd.index).trim();
  }

  const symKeys = Object.keys(SYMBOL_TO_ISO).sort((a, b) => b.length - a.length);
  for (const key of symKeys) {
    if (key.length === 1) {
      stripped = stripped.split(key).join("");
    } else {
      const esc = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      stripped = stripped.replace(new RegExp(esc, "gi"), "");
    }
  }
  stripped = stripped.replace(/\b(?:USD|EUR|GBP|JPY|CNY|CAD|AUD|CHF|INR|MXN|BRL)\b/gi, "");
  stripped = stripped
    .replace(/\b(?:US\$|US\s*\$|AU\$|CA\$)\b/gi, "")
    .replace(/US\$/gi, "");

  stripped = stripped.trim();
  if (!stripped) return null;

  const lastComma = stripped.lastIndexOf(",");
  const lastDot = stripped.lastIndexOf(".");
  let normalizedDigits = stripped;

  if (lastComma >= 0 && lastDot >= 0) {
    if (lastComma > lastDot) {
      normalizedDigits = stripped.replace(/\./g, "").replace(",", ".");
    } else {
      normalizedDigits = stripped.replace(/,/g, "");
    }
  } else if (lastComma >= 0) {
    const after = stripped.slice(lastComma + 1);
    if (/^\d{1,2}$/.test(after)) {
      normalizedDigits = stripped.replace(",", ".");
    } else {
      normalizedDigits = stripped.replace(/,/g, "");
    }
  } else {
    normalizedDigits = stripped.replace(/,/g, "");
  }

  normalizedDigits = normalizedDigits.replace(/[^\d.]/g, "");
  const dotCount = (normalizedDigits.match(/\./g) ?? []).length;
  if (dotCount > 1) return null;
  if (!/^\d*\.?\d+$/.test(normalizedDigits)) return null;

  const n = Number(normalizedDigits);
  if (!Number.isFinite(n) || n < 0) return null;

  return formatAmountString(n);
}

function formatAmountString(n: number): string {
  const s = n.toFixed(4);
  const trimmed = s.replace(/\.?0+$/, "");
  return trimmed === "" ? "0" : trimmed;
}

export function normalizePriceCandidate(
  candidate: RawPriceCandidate,
): NormalizedPrice | null {
  const amount = parseMoneyToDecimalString(candidate.raw);
  if (amount === null) return null;

  let currency =
    normalizeCurrencyHint(candidate.currencyHint) ??
    inferCurrencyFromRaw(candidate.raw);

  if (!currency) {
    if (candidate.raw.includes("€")) currency = "EUR";
    else if (candidate.raw.includes("£")) currency = "GBP";
    else if (/[¥￥]/.test(candidate.raw)) currency = "JPY";
    else if (candidate.raw.includes("₹")) currency = "INR";
    else if (candidate.raw.includes("$")) currency = "USD";
  }

  if (!currency) return null;

  return {
    amount,
    currency,
    method: candidate.method,
  };
}

function inferCurrencyFromRaw(raw: string): string | undefined {
  const m = raw.match(/\b([A-Za-z]{3})\s*$/);
  if (m && ISO4217.has(m[1].toUpperCase())) return m[1].toUpperCase();
  return undefined;
}

/** Prefer high confidence, then JSON-LD, then first parseable. */
const METHOD_ORDER: Record<string, number> = {
  "json-ld-product": 0,
  "json-ld-offer": 1,
  "open-graph": 2,
  microdata: 3,
  "meta-tag": 3,
  "data-attribute": 4,
};

const CONF_ORDER = { high: 0, medium: 1, low: 2 };

export function pickBestNormalized(
  candidates: RawPriceCandidate[],
): NormalizedPrice | null {
  const parsed: { norm: NormalizedPrice; score: number }[] = [];
  for (const c of candidates) {
    const norm = normalizePriceCandidate(c);
    if (!norm) continue;
    const conf = CONF_ORDER[c.confidence] ?? 2;
    const meth = METHOD_ORDER[c.method] ?? 9;
    parsed.push({ norm, score: conf * 10 + meth });
  }
  if (!parsed.length) return null;
  parsed.sort((a, b) => a.score - b.score);
  return parsed[0]!.norm;
}

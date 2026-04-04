import type { RawPriceCandidate } from "./types";

function asArray<T>(v: T | T[]): T[] {
  return Array.isArray(v) ? v : [v];
}

function pushPrice(
  out: RawPriceCandidate[],
  raw: unknown,
  currencyHint: string | undefined,
  method: RawPriceCandidate["method"],
  confidence: RawPriceCandidate["confidence"],
): void {
  if (raw === null || raw === undefined) return;
  const s = typeof raw === "number" ? String(raw) : String(raw).trim();
  if (!s) return;
  out.push({
    raw: s,
    currencyHint,
    method,
    confidence,
  });
}

function extractFromOffer(
  offer: Record<string, unknown>,
  out: RawPriceCandidate[],
): void {
  const currency =
    (offer.priceCurrency as string | undefined) ??
    (offer.currency as string | undefined);

  pushPrice(out, offer.price, currency, "json-ld-offer", "high");
  pushPrice(out, offer.lowPrice, currency, "json-ld-offer", "medium");
  pushPrice(out, offer.highPrice, currency, "json-ld-offer", "medium");

  const ps = offer.priceSpecification;
  const specs = ps ? asArray(ps as Record<string, unknown>) : [];
  for (const spec of specs) {
    if (!spec || typeof spec !== "object") continue;
    const s = spec as Record<string, unknown>;
    const c =
      (s.priceCurrency as string | undefined) ?? (s.currency as string | undefined);
    pushPrice(
      out,
      s.price ?? s.value,
      c ?? currency,
      "json-ld-offer",
      "high",
    );
  }
}

function visitNode(node: unknown, out: RawPriceCandidate[]): void {
  if (node === null || node === undefined) return;
  if (typeof node !== "object") return;

  if (Array.isArray(node)) {
    for (const item of node) visitNode(item, out);
    return;
  }

  const o = node as Record<string, unknown>;

  if ("@graph" in o) {
    visitNode(o["@graph"], out);
  }

  const types = o["@type"];
  const typeList = types
    ? asArray(types as string).map((t) => String(t).toLowerCase())
    : [];

  const isOffer = typeList.some(
    (t) => t === "offer" || t === "aggregateoffer",
  );
  if (isOffer) {
    extractFromOffer(o, out);
  }

  if (typeList.includes("product")) {
    const offers = o.offers;
    if (offers && typeof offers === "object") {
      for (const offer of asArray(
        offers as Record<string, unknown> | Record<string, unknown>[],
      )) {
        if (offer && typeof offer === "object" && !Array.isArray(offer)) {
          extractFromOffer(offer as Record<string, unknown>, out);
        }
      }
    }
  }
}

/** Parse JSON-LD script content and collect price candidates. */
export function extractFromJsonLdScript(content: string): RawPriceCandidate[] {
  const out: RawPriceCandidate[] = [];
  let data: unknown;
  try {
    data = JSON.parse(content);
  } catch {
    return out;
  }
  visitNode(data, out);
  return out;
}

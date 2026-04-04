import * as cheerio from "cheerio";
import { extractFromJsonLdScript } from "./json-ld";
import type { RawPriceCandidate } from "./types";

function uniqCandidates(candidates: RawPriceCandidate[]): RawPriceCandidate[] {
  const seen = new Set<string>();
  const out: RawPriceCandidate[] = [];
  for (const c of candidates) {
    const key = `${c.method}:${c.raw}:${c.currencyHint ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
  }
  return out;
}

function metaContent(
  $: cheerio.CheerioAPI,
  selectors: { prop: string; key?: string }[],
): string | undefined {
  for (const { prop, key } of selectors) {
    const el = key
      ? $(`meta[${key}="${prop}"]`).first()
      : $(`meta[property="${prop}"]`).first();
    const v = el.attr("content")?.trim();
    if (v) return v;
  }
  return undefined;
}

/**
 * Collect raw price strings from product HTML using JSON-LD, Open Graph,
 * microdata, meta tags, and common data-* attributes.
 */
export function extractRawPriceCandidates(html: string): RawPriceCandidate[] {
  const $ = cheerio.load(html);
  const out: RawPriceCandidate[] = [];

  $('script[type="application/ld+json"]').each((_, el) => {
    const text = $(el).text().trim();
    if (text) out.push(...extractFromJsonLdScript(text));
  });

  const ogAmount = metaContent($, [{ prop: "og:price:amount" }]);
  const ogCurrency =
    metaContent($, [{ prop: "og:price:currency" }]) ??
    metaContent($, [{ prop: "product:price:currency" }]);
  if (ogAmount) {
    out.push({
      raw: ogAmount,
      currencyHint: ogCurrency,
      method: "open-graph",
      confidence: "high",
    });
  }

  const metaAmount =
    metaContent($, [{ prop: "product:price:amount" }]) ??
    metaContent($, [{ key: "name", prop: "price" }]);
  const metaCurrency = metaContent($, [
    { key: "name", prop: "priceCurrency" },
    { prop: "product:price:currency" },
  ]);
  if (metaAmount && metaAmount !== ogAmount) {
    out.push({
      raw: metaAmount,
      currencyHint: metaCurrency ?? ogCurrency,
      method: "meta-tag",
      confidence: "medium",
    });
  }

  $("[itemprop=price], [itemprop='price']").each((_, el) => {
    const price = $(el).attr("content") ?? $(el).text();
    const cur =
      $(el).closest("[itemscope]").find("[itemprop=priceCurrency]").attr("content") ??
      $(el).siblings("[itemprop=priceCurrency]").attr("content") ??
      $(el).parent().find("[itemprop=priceCurrency]").first().attr("content");
    const p = price?.trim();
    if (p) {
      out.push({
        raw: p,
        currencyHint: cur?.trim(),
        method: "microdata",
        confidence: "high",
      });
    }
  });

  $("[data-price]").each((_, el) => {
    const price = $(el).attr("data-price")?.trim();
    const cur = $(el).attr("data-currency")?.trim();
    if (price) {
      out.push({
        raw: price,
        currencyHint: cur,
        method: "data-attribute",
        confidence: "low",
      });
    }
  });

  return uniqCandidates(out);
}

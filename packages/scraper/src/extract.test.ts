import { describe, expect, it } from "vitest";
import { extractNormalizedPrice, extractRawPriceCandidates } from "./index";

describe("extractRawPriceCandidates", () => {
  it("reads Product + Offer JSON-LD", () => {
    const html = `
      <html><head>
      <script type="application/ld+json">
      {"@context":"https://schema.org","@type":"Product","name":"Widget",
       "offers":{"@type":"Offer","price":"29.99","priceCurrency":"USD"}}
      </script></head><body></body></html>`;
    const c = extractRawPriceCandidates(html);
    expect(c.some((x) => x.raw === "29.99" && x.currencyHint === "USD")).toBe(
      true,
    );
  });

  it("reads Open Graph price meta", () => {
    const html = `<html><head>
      <meta property="og:price:amount" content="44" />
      <meta property="og:price:currency" content="EUR" />
    </head><body></body></html>`;
    const c = extractRawPriceCandidates(html);
    expect(c[0]?.raw).toBe("44");
    expect(c[0]?.currencyHint).toBe("EUR");
    expect(c[0]?.method).toBe("open-graph");
  });

  it("reads microdata price", () => {
    const html = `<div itemscope itemtype="https://schema.org/Product">
      <meta itemprop="priceCurrency" content="USD" />
      <span itemprop="price">18.50</span>
    </div>`;
    const c = extractRawPriceCandidates(html);
    expect(c.some((x) => x.method === "microdata" && x.raw === "18.50")).toBe(
      true,
    );
  });
});

describe("extractNormalizedPrice", () => {
  it("returns unified snapshot from JSON-LD", () => {
    const html = `
      <script type="application/ld+json">
      {"@type":"Product","offers":{"@type":"Offer","priceCurrency":"USD","price": "100.00"}}
      </script>`;
    expect(extractNormalizedPrice(html)).toEqual({
      amount: "100",
      currency: "USD",
      method: "json-ld-offer",
    });
  });
});

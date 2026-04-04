import { describe, expect, it } from "vitest";
import {
  extractNormalizedPrice,
  extractRawPriceCandidates,
} from "./index";

describe("QA: extractRawPriceCandidates — JSON-LD", () => {
  it("extracts from AggregateOffer with lowPrice and highPrice", () => {
    const html = `<script type="application/ld+json">
    {"@type":"Product","offers":{
      "@type":"AggregateOffer","lowPrice":"9.99","highPrice":"29.99","priceCurrency":"USD"
    }}</script>`;
    const c = extractRawPriceCandidates(html);
    expect(c.some((x) => x.raw === "9.99")).toBe(true);
    expect(c.some((x) => x.raw === "29.99")).toBe(true);
  });

  it("extracts from priceSpecification inside Offer", () => {
    const html = `<script type="application/ld+json">
    {"@type":"Offer","priceSpecification":{
      "price":"14.99","priceCurrency":"GBP"
    }}</script>`;
    const c = extractRawPriceCandidates(html);
    expect(c.some((x) => x.raw === "14.99" && x.currencyHint === "GBP")).toBe(true);
  });

  it("handles @graph wrapper", () => {
    const html = `<script type="application/ld+json">
    {"@graph":[{"@type":"Product","offers":{"@type":"Offer","price":"50","priceCurrency":"EUR"}}]}</script>`;
    const c = extractRawPriceCandidates(html);
    expect(c.some((x) => x.raw === "50" && x.currencyHint === "EUR")).toBe(true);
  });

  it("handles numeric price (not string) in JSON-LD", () => {
    const html = `<script type="application/ld+json">
    {"@type":"Offer","price":42,"priceCurrency":"USD"}</script>`;
    const c = extractRawPriceCandidates(html);
    expect(c.some((x) => x.raw === "42")).toBe(true);
  });

  it("handles multiple JSON-LD scripts", () => {
    const html = `
    <script type="application/ld+json">{"@type":"Offer","price":"10","priceCurrency":"USD"}</script>
    <script type="application/ld+json">{"@type":"Offer","price":"20","priceCurrency":"EUR"}</script>`;
    const c = extractRawPriceCandidates(html);
    expect(c.length).toBeGreaterThanOrEqual(2);
  });

  it("handles invalid JSON-LD gracefully", () => {
    const html = `<script type="application/ld+json">not valid json!</script>`;
    const c = extractRawPriceCandidates(html);
    expect(c).toEqual([]);
  });

  it("handles array of Offers inside Product", () => {
    const html = `<script type="application/ld+json">
    {"@type":"Product","offers":[
      {"@type":"Offer","price":"10","priceCurrency":"USD"},
      {"@type":"Offer","price":"12","priceCurrency":"EUR"}
    ]}</script>`;
    const c = extractRawPriceCandidates(html);
    expect(c.some((x) => x.raw === "10" && x.currencyHint === "USD")).toBe(true);
    expect(c.some((x) => x.raw === "12" && x.currencyHint === "EUR")).toBe(true);
  });

  it("uses currency field as fallback when priceCurrency absent", () => {
    const html = `<script type="application/ld+json">
    {"@type":"Offer","price":"5","currency":"CAD"}</script>`;
    const c = extractRawPriceCandidates(html);
    expect(c.some((x) => x.raw === "5" && x.currencyHint === "CAD")).toBe(true);
  });

  it("extracts value from priceSpecification when price absent", () => {
    const html = `<script type="application/ld+json">
    {"@type":"Offer","priceSpecification":{"value":"7.50","priceCurrency":"CHF"}}</script>`;
    const c = extractRawPriceCandidates(html);
    expect(c.some((x) => x.raw === "7.50" && x.currencyHint === "CHF")).toBe(true);
  });

  it("skips null/undefined price values", () => {
    const html = `<script type="application/ld+json">
    {"@type":"Offer","price":null,"priceCurrency":"USD"}</script>`;
    const c = extractRawPriceCandidates(html);
    expect(c.length).toBe(0);
  });
});

describe("QA: extractRawPriceCandidates — Open Graph", () => {
  it("reads product:price:currency as fallback", () => {
    const html = `<html><head>
      <meta property="og:price:amount" content="33" />
      <meta property="product:price:currency" content="CAD" />
    </head><body></body></html>`;
    const c = extractRawPriceCandidates(html);
    expect(c[0]?.currencyHint).toBe("CAD");
  });
});

describe("QA: extractRawPriceCandidates — meta tags", () => {
  it("reads meta name=price", () => {
    const html = `<html><head>
      <meta name="price" content="22.50" />
      <meta name="priceCurrency" content="USD" />
    </head><body></body></html>`;
    const c = extractRawPriceCandidates(html);
    expect(c.some((x) => x.method === "meta-tag" && x.raw === "22.50")).toBe(true);
  });

  it("reads product:price:amount meta", () => {
    const html = `<html><head>
      <meta property="product:price:amount" content="55" />
      <meta property="product:price:currency" content="GBP" />
    </head><body></body></html>`;
    const c = extractRawPriceCandidates(html);
    expect(c.some((x) => x.raw === "55")).toBe(true);
  });
});

describe("QA: extractRawPriceCandidates — microdata", () => {
  it("reads price from content attribute", () => {
    const html = `<div itemscope>
      <meta itemprop="price" content="99.99" />
      <meta itemprop="priceCurrency" content="EUR" />
    </div>`;
    const c = extractRawPriceCandidates(html);
    expect(c.some((x) => x.method === "microdata" && x.raw === "99.99")).toBe(true);
  });

  it("reads priceCurrency from sibling element", () => {
    const html = `<div itemscope>
      <span itemprop="price">45</span>
      <meta itemprop="priceCurrency" content="SEK" />
    </div>`;
    const c = extractRawPriceCandidates(html);
    const m = c.find((x) => x.method === "microdata");
    expect(m?.currencyHint).toBe("SEK");
  });
});

describe("QA: extractRawPriceCandidates — data attributes", () => {
  it("reads data-price and data-currency", () => {
    const html = `<div data-price="15.00" data-currency="NZD"></div>`;
    const c = extractRawPriceCandidates(html);
    expect(c.some((x) => x.method === "data-attribute" && x.raw === "15.00")).toBe(true);
    expect(c[0]?.currencyHint).toBe("NZD");
  });

  it("ignores empty data-price", () => {
    const html = `<div data-price="" data-currency="USD"></div>`;
    const c = extractRawPriceCandidates(html);
    expect(c.length).toBe(0);
  });
});

describe("QA: extractRawPriceCandidates — deduplication", () => {
  it("deduplicates identical candidates", () => {
    const html = `
      <div data-price="10" data-currency="USD"></div>
      <div data-price="10" data-currency="USD"></div>`;
    const c = extractRawPriceCandidates(html);
    const dataAttr = c.filter((x) => x.method === "data-attribute" && x.raw === "10");
    expect(dataAttr.length).toBe(1);
  });
});

describe("QA: extractNormalizedPrice — end-to-end", () => {
  it("prefers JSON-LD over OG when both present", () => {
    const html = `
      <html><head>
        <meta property="og:price:amount" content="25" />
        <meta property="og:price:currency" content="USD" />
        <script type="application/ld+json">
        {"@type":"Product","offers":{"@type":"Offer","price":"30","priceCurrency":"EUR"}}
        </script>
      </head><body></body></html>`;
    const p = extractNormalizedPrice(html);
    expect(p).not.toBeNull();
    expect(p!.method).toBe("json-ld-offer");
    expect(p!.amount).toBe("30");
    expect(p!.currency).toBe("EUR");
  });

  it("returns null for HTML with no price data", () => {
    const html = `<html><body><p>Hello world</p></body></html>`;
    expect(extractNormalizedPrice(html)).toBeNull();
  });

  it("handles prices with currency symbols in JSON-LD", () => {
    const html = `<script type="application/ld+json">
    {"@type":"Offer","price":"$19.99","priceCurrency":"USD"}</script>`;
    const p = extractNormalizedPrice(html);
    expect(p?.amount).toBe("19.99");
    expect(p?.currency).toBe("USD");
  });

  it("handles European-formatted price in OG tags", () => {
    const html = `<html><head>
      <meta property="og:price:amount" content="1.234,56" />
      <meta property="og:price:currency" content="EUR" />
    </head></html>`;
    const p = extractNormalizedPrice(html);
    expect(p?.amount).toBe("1234.56");
    expect(p?.currency).toBe("EUR");
  });

  it("handles zero price", () => {
    const html = `<script type="application/ld+json">
    {"@type":"Offer","price":"0","priceCurrency":"USD"}</script>`;
    const p = extractNormalizedPrice(html);
    expect(p?.amount).toBe("0");
    expect(p?.currency).toBe("USD");
  });
});

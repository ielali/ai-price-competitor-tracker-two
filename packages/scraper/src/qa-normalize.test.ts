import { describe, expect, it } from "vitest";
import {
  normalizePriceCandidate,
  parseMoneyToDecimalString,
  pickBestNormalized,
} from "./normalize";
import type { RawPriceCandidate } from "./types";

describe("QA: parseMoneyToDecimalString — edge cases", () => {
  it("trims trailing zeros (up to 4 fractional digits)", () => {
    expect(parseMoneyToDecimalString("10.0000")).toBe("10");
    expect(parseMoneyToDecimalString("10.5000")).toBe("10.5");
    expect(parseMoneyToDecimalString("10.1200")).toBe("10.12");
    expect(parseMoneyToDecimalString("10.1234")).toBe("10.1234");
  });

  it("handles integer amounts", () => {
    expect(parseMoneyToDecimalString("100")).toBe("100");
    expect(parseMoneyToDecimalString("0")).toBe("0");
  });

  it("handles amounts with currency symbols", () => {
    expect(parseMoneyToDecimalString("€29.99")).toBe("29.99");
    expect(parseMoneyToDecimalString("£100")).toBe("100");
    expect(parseMoneyToDecimalString("¥500")).toBe("500");
    expect(parseMoneyToDecimalString("₹999")).toBe("999");
  });

  it("handles European format: dot grouping, comma decimal", () => {
    expect(parseMoneyToDecimalString("1.234,56")).toBe("1234.56");
  });

  it("handles US format: comma grouping, dot decimal", () => {
    expect(parseMoneyToDecimalString("1,234.56")).toBe("1234.56");
    expect(parseMoneyToDecimalString("1,234,567.89")).toBe("1234567.89");
  });

  it("handles comma as decimal separator (1-2 digits after)", () => {
    expect(parseMoneyToDecimalString("15,50")).toBe("15.5");
    expect(parseMoneyToDecimalString("9,9")).toBe("9.9");
  });

  it("handles comma as grouping (3+ digits after)", () => {
    expect(parseMoneyToDecimalString("1,000")).toBe("1000");
  });

  it("returns non-negative result", () => {
    // Negative sign is stripped as non-digit by the implementation
    const result = parseMoneyToDecimalString("-5.00");
    // Either null or positive
    expect(result === null || Number(result) >= 0).toBe(true);
  });

  it("returns null for empty input", () => {
    expect(parseMoneyToDecimalString("")).toBeNull();
    expect(parseMoneyToDecimalString("   ")).toBeNull();
  });

  it("returns null for non-numeric text", () => {
    expect(parseMoneyToDecimalString("free")).toBeNull();
    expect(parseMoneyToDecimalString("n/a")).toBeNull();
    expect(parseMoneyToDecimalString("TBD")).toBeNull();
  });

  it("handles prices with trailing ISO code", () => {
    expect(parseMoneyToDecimalString("25 USD")).toBe("25");
    expect(parseMoneyToDecimalString("100.50 EUR")).toBe("100.5");
    expect(parseMoneyToDecimalString("1234 JPY")).toBe("1234");
  });

  it("handles amount with leading/trailing whitespace", () => {
    expect(parseMoneyToDecimalString("  42.99  ")).toBe("42.99");
  });

  it("handles US dollar prefix variations", () => {
    expect(parseMoneyToDecimalString("US$19.99")).toBe("19.99");
    expect(parseMoneyToDecimalString("us$19.99")).toBe("19.99");
  });

  it("handles zero amount", () => {
    expect(parseMoneyToDecimalString("0")).toBe("0");
    expect(parseMoneyToDecimalString("0.00")).toBe("0");
    expect(parseMoneyToDecimalString("$0")).toBe("0");
  });

  it("handles large numbers", () => {
    expect(parseMoneyToDecimalString("999999.99")).toBe("999999.99");
    expect(parseMoneyToDecimalString("1,000,000")).toBe("1000000");
  });
});

describe("QA: normalizePriceCandidate — currency inference", () => {
  it("infers GBP from £ symbol", () => {
    const c: RawPriceCandidate = {
      raw: "£25",
      method: "data-attribute",
      confidence: "low",
    };
    const n = normalizePriceCandidate(c);
    expect(n?.currency).toBe("GBP");
    expect(n?.amount).toBe("25");
  });

  it("infers JPY from ¥ symbol", () => {
    const c: RawPriceCandidate = {
      raw: "¥3000",
      method: "data-attribute",
      confidence: "low",
    };
    const n = normalizePriceCandidate(c);
    expect(n?.currency).toBe("JPY");
  });

  it("infers USD from $ symbol", () => {
    const c: RawPriceCandidate = {
      raw: "$99.99",
      method: "data-attribute",
      confidence: "low",
    };
    const n = normalizePriceCandidate(c);
    expect(n?.currency).toBe("USD");
  });

  it("infers INR from ₹ symbol", () => {
    const c: RawPriceCandidate = {
      raw: "₹500",
      method: "data-attribute",
      confidence: "low",
    };
    const n = normalizePriceCandidate(c);
    expect(n?.currency).toBe("INR");
  });

  it("infers currency from trailing ISO code in raw", () => {
    const c: RawPriceCandidate = {
      raw: "29.99 GBP",
      method: "meta-tag",
      confidence: "medium",
    };
    const n = normalizePriceCandidate(c);
    expect(n?.currency).toBe("GBP");
  });

  it("prefers currencyHint over raw inference", () => {
    const c: RawPriceCandidate = {
      raw: "$100 EUR",
      currencyHint: "CAD",
      method: "open-graph",
      confidence: "high",
    };
    const n = normalizePriceCandidate(c);
    expect(n?.currency).toBe("CAD");
  });

  it("returns null when no currency can be inferred", () => {
    const c: RawPriceCandidate = {
      raw: "100",
      method: "data-attribute",
      confidence: "low",
    };
    expect(normalizePriceCandidate(c)).toBeNull();
  });

  it("normalizes lowercase currency hint", () => {
    const c: RawPriceCandidate = {
      raw: "50",
      currencyHint: "usd",
      method: "json-ld-offer",
      confidence: "high",
    };
    const n = normalizePriceCandidate(c);
    expect(n?.currency).toBe("USD");
  });

  it("returns null for unknown currency symbol hint", () => {
    const c: RawPriceCandidate = {
      raw: "100",
      currencyHint: "XYZ",
      method: "data-attribute",
      confidence: "low",
    };
    // XYZ is not in ISO4217 set and not in symbol map
    expect(normalizePriceCandidate(c)).toBeNull();
  });
});

describe("QA: pickBestNormalized — ranking", () => {
  it("prefers medium-confidence JSON-LD over low-confidence data-attribute", () => {
    const candidates: RawPriceCandidate[] = [
      { raw: "5", currencyHint: "USD", method: "data-attribute", confidence: "low" },
      { raw: "10", currencyHint: "USD", method: "json-ld-offer", confidence: "medium" },
    ];
    expect(pickBestNormalized(candidates)?.amount).toBe("10");
  });

  it("prefers open-graph over microdata at same confidence", () => {
    const candidates: RawPriceCandidate[] = [
      { raw: "20", currencyHint: "USD", method: "microdata", confidence: "high" },
      { raw: "30", currencyHint: "USD", method: "open-graph", confidence: "high" },
    ];
    expect(pickBestNormalized(candidates)?.amount).toBe("30");
  });

  it("returns null for empty candidates", () => {
    expect(pickBestNormalized([])).toBeNull();
  });

  it("returns null when no candidates can be normalized", () => {
    const candidates: RawPriceCandidate[] = [
      { raw: "n/a", currencyHint: "USD", method: "data-attribute", confidence: "low" },
    ];
    expect(pickBestNormalized(candidates)).toBeNull();
  });

  it("skips unnormalizable and returns first valid", () => {
    const candidates: RawPriceCandidate[] = [
      { raw: "invalid", method: "json-ld-offer", confidence: "high" },
      { raw: "25", currencyHint: "USD", method: "data-attribute", confidence: "low" },
    ];
    expect(pickBestNormalized(candidates)?.amount).toBe("25");
  });
});

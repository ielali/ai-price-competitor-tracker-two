import { describe, expect, it } from "vitest";
import {
  normalizePriceCandidate,
  parseMoneyToDecimalString,
  pickBestNormalized,
} from "./normalize";
import type { RawPriceCandidate } from "./types";

describe("parseMoneyToDecimalString", () => {
  it("parses US grouping and decimal", () => {
    expect(parseMoneyToDecimalString("$1,234.56")).toBe("1234.56");
  });

  it("parses European decimal comma", () => {
    expect(parseMoneyToDecimalString("12,99 EUR")).toBe("12.99");
  });

  it("parses trailing ISO code", () => {
    expect(parseMoneyToDecimalString("19.99 GBP")).toBe("19.99");
  });

  it("returns null for garbage", () => {
    expect(parseMoneyToDecimalString("n/a")).toBeNull();
  });
});

describe("normalizePriceCandidate", () => {
  it("uses currency hint from JSON-LD style input", () => {
    const c: RawPriceCandidate = {
      raw: "49.00",
      currencyHint: "USD",
      method: "json-ld-offer",
      confidence: "high",
    };
    expect(normalizePriceCandidate(c)).toEqual({
      amount: "49",
      currency: "USD",
      method: "json-ld-offer",
    });
  });

  it("infers EUR from symbol", () => {
    const c: RawPriceCandidate = {
      raw: "€15,00",
      method: "meta-tag",
      confidence: "low",
    };
    const n = normalizePriceCandidate(c);
    expect(n?.currency).toBe("EUR");
    expect(n?.amount).toBe("15");
  });
});

describe("pickBestNormalized", () => {
  it("prefers high-confidence JSON-LD over data-attribute", () => {
    const candidates: RawPriceCandidate[] = [
      {
        raw: "9.99",
        currencyHint: "USD",
        method: "data-attribute",
        confidence: "low",
      },
      {
        raw: "19.99",
        currencyHint: "USD",
        method: "json-ld-offer",
        confidence: "high",
      },
    ];
    expect(pickBestNormalized(candidates)?.amount).toBe("19.99");
  });
});

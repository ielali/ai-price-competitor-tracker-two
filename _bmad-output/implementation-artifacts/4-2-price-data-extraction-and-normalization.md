# Story 4.2 — Price data extraction and normalization

## Summary

Implemented `@price-tracker/scraper` with HTML price discovery and canonical normalization for downstream storage.

## Acceptance criteria

- [x] Extract candidate prices from **JSON-LD** (`Product` / `Offer` / `AggregateOffer`, including `priceSpecification`).
- [x] Extract from **Open Graph** (`og:price:amount`, `og:price:currency`) and common **meta** / **microdata** / **`data-price`** hooks.
- [x] Normalize amounts to a **non-negative decimal string** (up to four fractional digits, trailing zeros trimmed) with **ISO 4217** currency when inferable.
- [x] **`extractNormalizedPrice(html)`** selects the best candidate by confidence and source quality.
- [x] **Automated tests** cover normalization edge cases and HTML fixtures.

## Key paths

- `packages/scraper/src/extract.ts` — DOM/meta traversal via `cheerio`.
- `packages/scraper/src/json-ld.ts` — JSON-LD graph walk.
- `packages/scraper/src/normalize.ts` — locale-style parsing and ISO mapping.
- `packages/scraper/src/*.test.ts` — Vitest suites.

## How to test

```bash
cd packages/scraper && npm test
```

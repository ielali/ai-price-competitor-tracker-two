# Story 4.3: Scraping status dashboard integration

Status: review

## Story

As a **dashboard user**,
I want to see live scraping queue health and recent jobs on the home dashboard,
so that I can tell whether automated price checks are running before deep-diving elsewhere.

## Acceptance Criteria

1. Dashboard home (`/`) shows a **Scraping activity** panel with count summaries (queued, active, completed, failed) and a **Recent jobs** table (job id, status, source label, last update).
2. Panel data is loaded via the existing **`GET /api/scraping/status`** JSON API (same payload as `getScrapingStatus()`), using credentials so authenticated sessions work with middleware.
3. Responses are not cached by the browser for this poll (`Cache-Control: no-store` on the route remains; client uses `cache: 'no-store'`).
4. The UI includes a loading skeleton before the first successful response and a clear inline error if the request fails before any data is available.
5. After the first successful load, the client **refreshes every 60 seconds** so the overview stays current without a full page reload.
6. Unit tests cover payload shaping (`getScrapingStatus`), the presentational view, and the client loader’s fetch behavior.

## Dev notes

- `getScrapingStatus()` remains the single source of truth for demo data; the route handler delegates to it for a stable public contract until BullMQ or Redis backs the API.
- `ScrapingStatusLive` is a client component so the dashboard can poll; avoid duplicate server `ScrapingStatusPanel` to prevent skipping the HTTP layer.

## Tasks / Subtasks

- [x] API route `GET /api/scraping/status` and shared `getScrapingStatus()` payload
- [x] `ScrapingStatusView` + skeleton + dashboard wiring
- [x] Client loader `ScrapingStatusLive` calling the API with refresh + error handling
- [x] Vitest coverage for lib, view, and live loader

## Dev Agent Record

### Completion notes

- Replaced direct server import on the dashboard with `ScrapingStatusLive`, which fetches `/api/scraping/status` on mount and every 60s.
- Removed redundant `scraping-status-panel.tsx` server wrapper.
- Added `scraping-status-live.test.tsx` for success and HTTP error paths.

### File list

- `apps/web/src/components/dashboard/scraping-status-live.tsx`
- `apps/web/src/app/(dashboard)/page.tsx`
- `apps/web/src/__tests__/scraping-status-live.test.tsx`
- `apps/web/src/app/api/scraping/status/route.ts` (unchanged contract)
- `apps/web/src/lib/scraping-status.ts`
- `apps/web/src/components/dashboard/scraping-status-view.tsx`
- `apps/web/src/components/dashboard/scraping-status-skeleton.tsx`

# Story 7.3: Alert History & Activity Log

Status: review

## Story

As a **user of the AI Competitor Price Tracker**,
I want a chronological alert history with filtering, status tracking, and quick navigation,
so that I can review triggered alerts and act on them efficiently.

## Acceptance Criteria

1. **Chronological log** — Table lists Date/Time, Product, Trigger Condition, Channel, and Status; newest first.
2. **Status badges** — Visual distinction: New (blue), Acknowledged (yellow), Resolved (green).
3. **Filters** — Filter by product, status, and date range; optional “Show archived” for archived rows.
4. **Bulk actions** — Select rows; “Mark as read” (new → acknowledged) and “Archive” (sets archived flag).
5. **Unread badge** — Desktop sidebar and mobile nav show a count badge on Alerts when there are unread (non-archived `new`) items.
6. **Row navigation** — Clicking a row navigates to `/products/{productId}` (product detail).
7. **Tests** — Vitest covers filters, store actions, and key UI behaviors (`alert-history-*.test.*`).

## Tasks / Subtasks

- [x] Types, seed data, and `filterAlertEntries` / `countUnreadAlerts` helpers
- [x] Zustand `useAlertHistoryStore` with selection and bulk mutations
- [x] `AlertHistoryView` page UI on `/alerts`
- [x] `AlertStatusBadge` styling
- [x] Sidebar and mobile nav unread badges
- [x] Unit and component tests

## Dev Notes

- Data is client-local (`ALERT_HISTORY_SEED`) until notification/history APIs exist (Epic 7.2 / backend).
- Archived entries are hidden by default unless “Show archived” is checked.

## Dev Agent Record

### File List

- `apps/web/src/lib/alert-history-types.ts`
- `apps/web/src/lib/alert-history-seed.ts`
- `apps/web/src/lib/alert-history-filters.ts`
- `apps/web/src/stores/alert-history-store.ts`
- `apps/web/src/components/alerts/alert-history-view.tsx`
- `apps/web/src/components/alerts/alert-status-badge.tsx`
- `apps/web/src/app/(dashboard)/alerts/page.tsx`
- `apps/web/src/components/layout/sidebar.tsx` — unread badge
- `apps/web/src/components/layout/mobile-nav.tsx` — unread badge
- `apps/web/src/__tests__/alert-history-filters.test.ts`
- `apps/web/src/__tests__/alert-history-store.test.ts`
- `apps/web/src/__tests__/alert-history-view.test.tsx`

### Testing

`cd apps/web && npm test` — all tests green.

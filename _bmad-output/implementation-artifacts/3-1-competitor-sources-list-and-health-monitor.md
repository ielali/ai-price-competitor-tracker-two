# Story 3.1: Competitor Sources List & Health Monitor

Status: review

## Story

As a **pricing or product operator**,
I want a list of all competitor URLs the system tracks with visible scrape health,
so that I can quickly see whether data collection is reliable and which sources need attention.

## Acceptance Criteria

1. **Competitors** page shows a table of competitor sources with: label, platform, URL (link), 7-day success rate, last successful scrape time, and a health indicator.
2. Health indicator uses three states — **Healthy**, **Degraded**, **Critical** — derived from 7-day success rate and recency of last success (aligned with operational targets: ≥90% healthy band, &lt;70% critical).
3. A **summary** above the table shows: total sources, average 7-day success rate, count healthy, and counts that need attention (degraded / critical).
4. Empty state copy is shown when there are no sources (table placeholder).
5. Automated tests cover health classification logic and that the page renders mock sources and summary.

## Tasks / Subtasks

- [x] Domain types and `classifySourceHealth` / `summarizeSourcesHealth` in `apps/web/src/lib/competitor-sources.ts`
- [x] UI: `CompetitorSourcesView`, `SourceHealthBadge`, wired from `apps/web/src/app/(dashboard)/competitors/page.tsx`
- [x] Seed/mock data for development until API exists
- [x] Vitest: `competitor-sources.test.ts`, `competitors-page.test.tsx`

## Dev Notes

- Health rules: critical if no last success, invalid timestamp, rate &lt;70%, or last success ≥72h ago; degraded if rate &lt;90% or last success ≥24h ago (otherwise healthy). Hours since last success uses `Math.max(0, …)` so future timestamps do not confuse classification.
- URLs open in a new tab with `rel="noopener noreferrer"`.

## References

- PRD scraping health expectations (success rates, per-source visibility).

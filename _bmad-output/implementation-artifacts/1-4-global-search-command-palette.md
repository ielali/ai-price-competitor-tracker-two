# Story 1.4: Global Search & Command Palette

Status: review

## Story

As a **user of the AI Competitor Price Tracker**,
I want to open a keyboard-driven command palette to jump to any main section,
so that I can navigate quickly without relying only on the sidebar.

## Acceptance Criteria

1. Pressing **Ctrl+K** (Windows/Linux) or **⌘+K** (macOS) opens a modal command palette from any dashboard page.
2. The palette lists all primary routes: Dashboard, Products, Competitors, Alerts, Reports, and Settings (same destinations as the sidebar).
3. Typing filters the list to matching page names or paths.
4. Choosing an item navigates with Next.js client routing and closes the palette.
5. A visible **Search** control in the dashboard header opens the same palette (discoverability); shortcut hint shown on larger viewports.
6. Dialog includes an accessible name and description; focus is managed by the modal.

## Tasks / Subtasks

- [x] Add `cmdk` and shadcn-style `Command` UI primitives
- [x] Zustand store for open state shared by trigger and palette
- [x] Integrate `CommandPalette` and trigger into `(dashboard)/layout.tsx`
- [x] Vitest coverage and jsdom polyfills for `ResizeObserver` / `scrollIntoView`

## Dev Agent Record

### File List

- `apps/web/src/components/ui/command.tsx`
- `apps/web/src/components/layout/command-palette.tsx`
- `apps/web/src/components/layout/command-palette-trigger.tsx`
- `apps/web/src/stores/command-palette-store.ts`
- `apps/web/src/app/(dashboard)/layout.tsx`
- `apps/web/src/__tests__/command-palette.test.tsx`
- `apps/web/src/__tests__/setup.ts`
- `apps/web/package.json`
- `package-lock.json`

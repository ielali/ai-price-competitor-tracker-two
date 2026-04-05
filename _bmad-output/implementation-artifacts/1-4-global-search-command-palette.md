# Story 1.4: Global Search Command Palette

Status: review

## Story

As a **user of the AI Competitor Price Tracker**,
I want a keyboard-driven command palette to jump to any main section,
so that I can navigate quickly without reaching for the sidebar.

## Acceptance Criteria

1. **Shortcut** — Pressing ⌘K (macOS) or Ctrl+K (Windows/Linux) opens a modal command palette from any dashboard route; pressing the same chord again closes it; Escape closes the palette.
2. **Search** — The palette includes a search field with an icon and placeholder; typing filters navigation destinations by name or path.
3. **Destinations** — All primary app sections from the shell are listed: Dashboard, Products, Competitors, Alerts, Reports, and Settings.
4. **Navigation** — Choosing an item (click or keyboard) closes the palette and navigates to the corresponding route via client-side routing.
5. **Accessibility** — The dialog exposes a screen-reader title and description; focus is managed by the modal; items remain keyboard operable via cmdk defaults.
6. **Tests & build** — Vitest covers open/close shortcuts, filtering, and navigation; `npm run lint` and `npm run build` succeed.

## Tasks / Subtasks

- [x] Add `cmdk` and shadcn-style `Command` UI primitives
- [x] Implement `CommandPalette` with global shortcut and router navigation
- [x] Mount palette in `(dashboard)/layout.tsx`
- [x] Extend `DialogContent` with optional `showCloseButton` for embedded dialogs
- [x] Vitest setup stubs for `ResizeObserver` / `scrollIntoView` (jsdom + cmdk)
- [x] Automated tests for command palette behavior

## Dev Notes

- Reuses `mainNavItems` and `bottomNavItem` from `nav-items.ts` for a single source of truth with the sidebar.
- Login and other non-dashboard routes do not mount the palette (layout is only on authenticated dashboard group).

## Dev Agent Record

### File List

- `apps/web/package.json` — `cmdk` dependency
- `apps/web/src/components/ui/command.tsx`
- `apps/web/src/components/ui/dialog.tsx` — `showCloseButton` prop
- `apps/web/src/components/layout/command-palette.tsx`
- `apps/web/src/app/(dashboard)/layout.tsx`
- `apps/web/src/__tests__/command-palette.test.tsx`
- `apps/web/src/__tests__/setup.ts` — test polyfills for cmdk
- `apps/web/src/__tests__/auth-jwt.test.ts` — `/** @vitest-environment node */` so jose signing works under Vitest jsdom
- `apps/web/src/app/api/auth/refresh/route.ts` — import `signRefreshToken` for production build / typecheck

### Completion Notes

- Command palette is client-only; no middleware changes required.

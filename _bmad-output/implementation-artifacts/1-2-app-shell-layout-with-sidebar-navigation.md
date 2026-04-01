# Story 1.2: App Shell Layout with Sidebar Navigation

Status: review

## Story

As a **user navigating the AI Competitor Price Tracker**,
I want a persistent app shell with a collapsible sidebar, breadcrumbs, and responsive layout,
so that I can efficiently navigate between all sections of the application on any device.

## Acceptance Criteria

1. Sidebar renders at 240px with icons + labels for: Dashboard, Products, Competitors, Alerts, Reports, Settings
2. Sidebar collapses to 64px icon-only mode via toggle button; state persists across navigation
3. Active nav item is visually highlighted
4. Breadcrumbs render on all non-dashboard pages (e.g., `Dashboard / Products / [Product Name]`)
5. Content area has max-width 1440px, centered, with 24px padding
6. Responsive: sidebar becomes bottom tab bar on mobile (<768px) with 5 items
7. All nav items are keyboard-navigable with visible focus rings
8. Skip-to-content link is present and functional

## Tasks / Subtasks

- [x] Task 1: Create the app shell layout at `apps/web/src/app/(dashboard)/layout.tsx` (AC: #1, #5)
  - [x] Create `(dashboard)` route group directory under `apps/web/src/app/`
  - [x] Create `layout.tsx` that wraps all protected pages with sidebar + main content area
  - [x] Main content area: `<main>` with `max-w-content` (1440px), `mx-auto`, and `p-6` (24px)
  - [x] Render `<Sidebar />` component and `<Breadcrumbs />` above main content
  - [x] Create placeholder `page.tsx` in `(dashboard)/` directory as the dashboard home

- [x] Task 2: Build the `<Sidebar />` component at `apps/web/src/components/layout/sidebar.tsx` (AC: #1, #2, #3)
  - [x] Create `apps/web/src/components/layout/` directory
  - [x] Implement sidebar with two states: expanded (240px, icons + labels) and collapsed (64px, icons only)
  - [x] Navigation items with Lucide React icons:
    - Dashboard → `LayoutDashboard` icon → route `/`
    - Products → `Package` icon → route `/products`
    - Competitors → `Users` icon → route `/competitors`
    - Alerts → `Bell` icon → route `/alerts`
    - Reports → `BarChart3` icon → route `/reports`
    - Settings → `Settings` icon → route `/settings` (pinned to bottom of sidebar)
  - [x] Collapse/expand toggle button at bottom of sidebar (above Settings on desktop)
  - [x] Active nav item: distinct background color + left border accent (use `bg-accent` + `border-l-2 border-primary`)
  - [x] Detect active route using `usePathname()` from `next/navigation`

- [x] Task 3: Persist sidebar collapsed state with Zustand (AC: #2)
  - [x] Install Zustand: `npm install zustand` in `apps/web/`
  - [x] Create store at `apps/web/src/stores/sidebar-store.ts`
  - [x] Store shape: `{ collapsed: boolean; toggle: () => void }`
  - [x] Persist to `localStorage` using Zustand `persist` middleware so state survives navigation and refresh
  - [x] Sidebar reads from store; toggle button dispatches `toggle()`

- [x] Task 4: Build the `<Breadcrumbs />` component at `apps/web/src/components/layout/breadcrumbs.tsx` (AC: #4)
  - [x] Render breadcrumb trail based on current route path segments
  - [x] First segment always "Dashboard" linking to `/`
  - [x] Subsequent segments derived from URL path (capitalize, replace hyphens with spaces)
  - [x] Last segment is plain text (current page, not a link)
  - [x] Use `<nav aria-label="Breadcrumb">` with `<ol>` for semantic markup
  - [x] Separator: `/` or `>` between items
  - [x] Hide breadcrumbs on dashboard home page (`/`)

- [x] Task 5: Responsive mobile layout — bottom tab bar (AC: #6)
  - [x] On screens < 768px, hide the sidebar completely
  - [x] Render a fixed-bottom tab bar (`<nav>`) with 5 items: Dashboard, Products, Competitors, Alerts, Reports
  - [x] Settings accessible from a menu/gear icon in the mobile tab bar or top header
  - [x] Active tab highlighted with color accent
  - [x] Tab bar icons match sidebar icons; labels rendered below icons at small size
  - [x] Tab bar height ~56-64px; safe-area padding for notched devices (`pb-safe`)

- [x] Task 6: Keyboard accessibility and skip link (AC: #7, #8)
  - [x] Add skip-to-content link as first focusable element in the layout: `<a href="#main-content" class="sr-only focus:not-sr-only ...">Skip to content</a>`
  - [x] Main content area has `id="main-content"` and `tabindex="-1"` for focus target
  - [x] All sidebar nav items are `<a>` or Next.js `<Link>` (natively keyboard-focusable)
  - [x] Visible focus rings on all interactive elements: use Tailwind `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
  - [x] Tab order: skip link → sidebar nav items (top to bottom) → main content
  - [x] Collapsed sidebar tooltip on hover/focus showing full label (use shadcn/ui `Tooltip`)

## Dev Notes

### Technical Stack for This Story

| Technology | Usage | Notes |
|------------|-------|-------|
| Next.js App Router | Route groups, layouts | `(dashboard)` route group for protected pages |
| Tailwind CSS | All styling | Utility-first; use custom tokens from Story 1.1 |
| shadcn/ui | Tooltip, Button | Tooltip for collapsed sidebar labels; Button for toggle |
| Lucide React | Nav icons | `npm install lucide-react` (likely already a shadcn/ui dep) |
| Zustand + persist | Sidebar state | `npm install zustand` — lightweight client state |
| next/navigation | Route detection | `usePathname()` for active nav highlighting |

[Source: architecture.md#2.1 — Frontend technology stack]

### Architecture-Mandated File Locations

Story 1.1 created the project skeleton. This story adds:

```
apps/web/src/
├── app/
│   ├── (dashboard)/              # Route group for protected pages
│   │   ├── layout.tsx            # ← App shell (sidebar + breadcrumbs + main)
│   │   ├── page.tsx              # ← Dashboard placeholder
│   │   ├── products/
│   │   │   └── page.tsx          # ← Stub for future
│   │   ├── competitors/
│   │   │   └── page.tsx          # ← Stub for future
│   │   ├── alerts/
│   │   │   └── page.tsx          # ← Stub for future
│   │   ├── reports/
│   │   │   └── page.tsx          # ← Stub for future
│   │   └── settings/
│   │       └── page.tsx          # ← Stub for future
│   ├── (auth)/                   # ← Stub directory for Story 1.3
│   │   └── .gitkeep
│   └── layout.tsx                # Root layout (from Story 1.1 — DO NOT MODIFY)
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx           # ← Sidebar component
│   │   ├── breadcrumbs.tsx       # ← Breadcrumbs component
│   │   ├── mobile-tab-bar.tsx    # ← Mobile bottom nav
│   │   └── skip-link.tsx         # ← Skip-to-content link
│   └── ui/                       # shadcn/ui (from Story 1.1 — DO NOT MODIFY)
└── stores/
    └── sidebar-store.ts          # ← Zustand sidebar state
```

[Source: architecture.md#5 — Project structure]

### UX Specification Details

**Sidebar (Desktop ≥768px):**
- Width: 240px expanded, 64px collapsed
- Background: white or `bg-background` (shadcn theme)
- Border-right separator: `border-r`
- Nav items: 44px height, 12px horizontal padding, 8px vertical padding
- Icon size: 20px (Lucide default)
- Label font: 14px, medium weight
- Settings pinned to sidebar bottom, separated by a divider
- Collapse toggle: chevron icon (`ChevronLeft`/`ChevronRight`)

**Breadcrumbs:**
- Position: above main content, below any top header/banner
- Font: 14px, normal weight, muted color (`text-muted-foreground`)
- Current page: `text-foreground` (not a link)

**Content Area:**
- Max-width: 1440px (`max-w-content` custom token from Story 1.1)
- Horizontal centering: `mx-auto`
- Padding: 24px all sides (`p-6`)

**Mobile (<768px):**
- Bottom tab bar replaces sidebar
- Tab bar: fixed to bottom, full width, white background, top border
- 5 tabs: Dashboard, Products, Competitors, Alerts, Reports
- Active tab: colored icon + label; inactive: muted
- Safe area bottom padding for iOS notch

[Source: ux-spec.md#2, #5, #9 — IA, Design System, Navigation]

### Responsive Breakpoints

| Breakpoint | Layout |
|-----------|--------|
| < 768px (mobile) | Bottom tab bar; no sidebar; breadcrumbs hidden or minimal |
| 768px–1279px (tablet) | Sidebar collapsed by default; content single column |
| ≥ 1280px (desktop) | Sidebar expanded by default; full layout |

[Source: ux-spec.md#4.1 — Responsive behavior]

### Naming Conventions

| Context | Convention | Example |
|---------|-----------|---------|
| Component files | kebab-case | `sidebar.tsx`, `mobile-tab-bar.tsx` |
| Component exports | PascalCase | `Sidebar`, `MobileTabBar` |
| Store files | kebab-case | `sidebar-store.ts` |
| Route directories | kebab-case | `(dashboard)/products/` |

[Source: architecture.md#7.1 — Naming conventions]

### Accessibility Requirements (WCAG 2.1 AA)

- **Skip link**: Must be first focusable element; visible on focus; targets `#main-content`
- **Nav landmark**: Sidebar wrapped in `<nav aria-label="Main navigation">`
- **Breadcrumb landmark**: Wrapped in `<nav aria-label="Breadcrumb">`
- **Active state**: Announced to screen readers (`aria-current="page"` on active nav link)
- **Collapsed tooltips**: When sidebar is collapsed, icon-only items need `aria-label` and visible tooltip on hover/focus
- **Focus rings**: Use `focus-visible:ring-2 focus-visible:ring-ring` — visible outline on keyboard focus
- **Contrast**: All nav text/icons meet 4.5:1 ratio against background
- **Color-coded indicators**: Badge on Alerts nav item must not be color-only (include count number)
- **Motion**: Sidebar expand/collapse animation respects `prefers-reduced-motion`

[Source: ux-spec.md#7 — Accessibility Requirements]

### Dependencies on Story 1.1

This story builds directly on the scaffolded project from Story 1.1. Assumes:
- Turborepo monorepo at repo root with `apps/web/` containing Next.js app
- Tailwind CSS configured with custom color tokens (`price-down`, `price-up`, `stable`, `anomaly`, `user-price`)
- shadcn/ui installed with `Button`, `Tooltip` components available
- Inter font loaded in root layout
- `max-w-content` (1440px) custom token in Tailwind config
- ESLint + Prettier configured

If Story 1.1 is not yet implemented, the dev agent should set up these prerequisites or stub them.

### What This Story Does NOT Include

- No authentication or route protection (Story 1.3)
- No command palette / Cmd+K search (Story 1.4)
- No real page content beyond placeholder text (future epics)
- No backend API calls
- No alert badge count (requires backend data — Story 7.x); add static "0" or omit badge for now
- No real-time WebSocket updates
- No right-click context menus on nav items

### Potential Pitfalls

1. **Zustand hydration mismatch**: Using `persist` with `localStorage` causes SSR/client mismatch. Wrap sidebar state access in `useEffect` or use Zustand's `skipHydration` option to avoid Next.js hydration errors.
2. **Route group `(dashboard)` naming**: The parentheses are intentional Next.js syntax for route groups — they don't appear in the URL. Ensure `(dashboard)/products/page.tsx` maps to `/products`.
3. **Mobile tab bar z-index**: Fixed bottom bar must sit above page content. Use `z-50` and ensure no content is hidden behind it (add bottom padding to main content on mobile).
4. **Sidebar animation performance**: Use CSS transitions on `width` (not JavaScript animation) for smooth expand/collapse. Consider `will-change: width` for GPU acceleration.
5. **Active route matching**: `usePathname()` returns the full path. For nested routes like `/products/123`, the "Products" nav item should still be active — use `pathname.startsWith('/products')` matching, not exact match.
6. **shadcn/ui Tooltip import**: Ensure `Tooltip`, `TooltipTrigger`, `TooltipContent`, and `TooltipProvider` are installed via `npx shadcn@latest add tooltip`.
7. **Content shift on sidebar toggle**: Main content width should adjust smoothly when sidebar expands/collapses. Use CSS `transition-all` on the main content wrapper's `margin-left` or flex layout.

### References

- [Source: architecture.md#2.1] — Frontend technology stack (Next.js, Tailwind, shadcn/ui, Zustand)
- [Source: architecture.md#5] — Full monorepo project structure with route layout
- [Source: architecture.md#7.1] — Naming conventions
- [Source: architecture.md#7.4] — Component structure pattern
- [Source: ux-spec.md#2] — Information architecture and navigation hierarchy
- [Source: ux-spec.md#4.1] — Dashboard responsive behavior
- [Source: ux-spec.md#5] — Design system: spacing, typography, component library
- [Source: ux-spec.md#7] — WCAG 2.1 AA accessibility requirements
- [Source: ux-spec.md#9] — Navigation and wayfinding (sidebar, breadcrumbs, global search)
- [Source: ux-spec.md#10] — Mobile layout considerations
- [Source: epics-and-stories.md#Epic1-Story1.2] — Story acceptance criteria
- [Source: prd.md#6] — Technical architecture summary

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- ✅ Dashboard layout created at `apps/web/src/app/(dashboard)/layout.tsx` with sidebar, breadcrumbs, skip link, and main content area
- ✅ Sidebar component built with expanded (240px/w-60) and collapsed (64px/w-16) states; CSS transition with reduced-motion support
- ✅ Active nav highlighting uses `bg-accent text-accent-foreground border-l-2 border-primary`
- ✅ All 6 nav items implemented with correct Lucide React icons and routes; Settings pinned to bottom
- ✅ Zustand store with `persist` middleware persists collapsed state to localStorage
- ✅ Breadcrumbs component auto-generates trail from URL segments; hidden on dashboard root `/`
- ✅ Mobile bottom tab bar (MobileNav) shows 5 items at `md:hidden`; active item highlighted
- ✅ Skip-to-content link as first focusable element; `#main-content` with `tabindex=-1`
- ✅ Keyboard focus rings on all nav items using `focus-visible:ring-2 focus-visible:ring-ring`
- ✅ Collapsed sidebar shows tooltips via shadcn/ui Tooltip component
- ✅ 27 tests passing covering all components and the Zustand store
- ✅ `npm run build` compiles successfully; `npm run lint` passes with zero warnings
- ✅ Placeholder pages created for all routes: `/`, `/products`, `/competitors`, `/alerts`, `/reports`, `/settings`

### File List

- `apps/web/src/app/(dashboard)/layout.tsx`
- `apps/web/src/app/(dashboard)/page.tsx`
- `apps/web/src/app/(dashboard)/products/page.tsx`
- `apps/web/src/app/(dashboard)/competitors/page.tsx`
- `apps/web/src/app/(dashboard)/alerts/page.tsx`
- `apps/web/src/app/(dashboard)/reports/page.tsx`
- `apps/web/src/app/(dashboard)/settings/page.tsx`
- `apps/web/src/components/layout/sidebar.tsx`
- `apps/web/src/components/layout/breadcrumbs.tsx`
- `apps/web/src/components/layout/mobile-nav.tsx`
- `apps/web/src/components/layout/nav-items.ts`
- `apps/web/src/components/ui/breadcrumb.tsx`
- `apps/web/src/components/ui/tooltip.tsx`
- `apps/web/src/stores/sidebar-store.ts`
- `apps/web/tailwind.config.ts`
- `apps/web/package.json`
- `apps/web/src/__tests__/sidebar.test.tsx`
- `apps/web/src/__tests__/breadcrumbs.test.tsx`
- `apps/web/src/__tests__/mobile-nav.test.tsx`
- `apps/web/src/__tests__/sidebar-store.test.ts`
- `apps/web/src/__tests__/nav-items.test.ts`
- `apps/web/src/__tests__/setup.ts`
- `apps/web/vitest.config.ts`

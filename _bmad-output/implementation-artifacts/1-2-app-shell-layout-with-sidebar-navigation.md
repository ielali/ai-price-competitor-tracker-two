# Story 1.2: App Shell Layout with Sidebar Navigation

Status: review

## Story

As a **user of the AI Competitor Price Tracker**,
I want a persistent app shell with collapsible sidebar navigation, breadcrumbs, and a responsive layout,
so that I can efficiently navigate between all sections of the application with a consistent, accessible experience.

## Acceptance Criteria

1. Sidebar renders at 240px width with icons + labels for: Dashboard, Products, Competitors, Alerts, Reports, Settings
2. Sidebar collapses to 64px icon-only mode via toggle button; collapse state persists across navigation (Zustand store or localStorage)
3. Active nav item is visually highlighted (distinct background/text color)
4. Breadcrumbs render on all non-dashboard pages (e.g., `Dashboard / Products / [Product Name]`)
5. Content area has max-width 1440px, centered, with 24px padding
6. Responsive: sidebar becomes bottom tab bar on mobile (<768px) with 5 items (Dashboard, Products, Competitors, Alerts, Reports — Settings accessible via user menu)
7. All nav items are keyboard-navigable with visible focus rings
8. Skip-to-content link is present and functional (first focusable element)

## Tasks / Subtasks

- [x] Task 1: Create the root dashboard layout (AC: #5)
  - [x] Create `apps/web/src/app/(dashboard)/layout.tsx` as the shared layout for all authenticated pages
  - [x] Layout structure: sidebar on the left + main content area on the right (flex row)
  - [x] Content area: max-width 1440px, `mx-auto`, `p-6` (24px padding)
  - [x] Add `<a href="#main-content" className="sr-only focus:not-sr-only ...">Skip to content</a>` as the first element in the layout

- [x] Task 2: Build the Sidebar component (AC: #1, #2, #3)
  - [x] Create `apps/web/src/components/layout/sidebar.tsx`
  - [x] Nav items with Lucide icons:
    - Dashboard → `LayoutDashboard` icon → `/`
    - Products → `Package` icon → `/products`
    - Competitors → `Users` icon → `/competitors`
    - Alerts → `Bell` icon → `/alerts`
    - Reports → `BarChart3` icon → `/reports`
    - Settings → `Settings` icon → `/settings` (positioned at bottom of sidebar)
  - [x] Expanded state: 240px width, icon + label visible
  - [x] Collapsed state: 64px width, icon only with tooltip on hover
  - [x] Toggle button: chevron icon at the bottom or top of sidebar
  - [x] Active route detection using `usePathname()` — highlight with `bg-accent text-accent-foreground` or equivalent shadcn/ui pattern
  - [x] Store collapse state using Zustand or `localStorage` to persist across navigation and refresh

- [x] Task 3: Implement Breadcrumb component (AC: #4)
  - [x] Create `apps/web/src/components/layout/breadcrumbs.tsx`
  - [x] Auto-generate breadcrumbs from URL path segments
  - [x] Capitalize and de-slugify path segments (e.g., `/products` → "Products")
  - [x] Dynamic segments (e.g., `[id]`) should show the entity name if available, or fallback to the ID
  - [x] Dashboard (home) is always the first crumb; current page is non-linked last crumb
  - [x] Hidden on the Dashboard page itself (when path is `/`)
  - [x] Uses `<nav aria-label="Breadcrumb">` with `<ol>` structure per WCAG
  - [x] Separator character: `/` or `>` — install shadcn/ui Breadcrumb: `npx shadcn@latest add breadcrumb`

- [x] Task 4: Responsive mobile layout (AC: #6)
  - [x] Below 768px breakpoint (`md`), hide the sidebar
  - [x] Show a bottom tab bar (`fixed bottom-0`) with 5 navigation items: Dashboard, Products, Competitors, Alerts, Reports
  - [x] Settings accessible via a user/hamburger menu in the header area on mobile
  - [x] Bottom tab bar items: icon + small label text, active state highlighted
  - [x] Content area uses full width on mobile (no max-width constraint)
  - [x] Mobile bottom bar has `z-50` and a top border for visual separation
  - [x] Add padding-bottom to main content on mobile to prevent bottom bar overlap

- [x] Task 5: Keyboard accessibility and skip-to-content (AC: #7, #8)
  - [x] Skip-to-content link: visually hidden by default, visible on focus, links to `#main-content`
  - [x] Main content area has `id="main-content"` and `tabindex="-1"` for programmatic focus
  - [x] All sidebar nav links have visible focus rings (Tailwind `focus-visible:ring-2 focus-visible:ring-ring`)
  - [x] Tab order follows visual order: skip-to-content → sidebar nav items → main content
  - [x] Mobile bottom tab bar is also keyboard-navigable
  - [x] Sidebar toggle button has `aria-label` describing its action ("Collapse sidebar" / "Expand sidebar")
  - [x] Current nav item has `aria-current="page"` attribute

- [x] Task 6: Create placeholder pages for all nav destinations
  - [x] Create route files to prevent 404s during navigation:
    - `apps/web/src/app/(dashboard)/page.tsx` — Dashboard home
    - `apps/web/src/app/(dashboard)/products/page.tsx` — Products list placeholder
    - `apps/web/src/app/(dashboard)/competitors/page.tsx` — Competitors placeholder
    - `apps/web/src/app/(dashboard)/alerts/page.tsx` — Alerts placeholder
    - `apps/web/src/app/(dashboard)/reports/page.tsx` — Reports placeholder
    - `apps/web/src/app/(dashboard)/settings/page.tsx` — Settings placeholder
  - [x] Each placeholder: page title heading + "Coming soon" text
  - [x] These placeholders allow testing navigation without 404 errors

## Dev Notes

### Dependency on Story 1.1

This story assumes Story 1.1 is complete. The following must already be in place:
- Next.js 14+ with App Router at `apps/web/`
- Tailwind CSS with custom color tokens configured
- shadcn/ui initialized with components in `src/components/ui/`
- Inter font loaded via `next/font/google`
- TypeScript strict mode enabled

**Note:** Story 1.1 explicitly did NOT install Zustand. If using Zustand for sidebar state persistence, install it in this story: `npm install zustand`. Alternatively, use `localStorage` directly via a custom hook to avoid the extra dependency — either approach is acceptable.

### Technical Stack for This Story

| Technology | Purpose | Notes |
|------------|---------|-------|
| Next.js App Router | Layout system with `layout.tsx` | Nested layouts for `(dashboard)` route group |
| Tailwind CSS | All styling | Utility classes only; no custom CSS files |
| shadcn/ui | UI primitives | Use Button, Tooltip components; install Tooltip if not yet added: `npx shadcn@latest add tooltip` |
| Lucide React | Icon library | Ships with shadcn/ui; import icons from `lucide-react` |
| Zustand | Sidebar collapse state | Lightweight store; OR use localStorage directly |
| `usePathname()` | Active route detection | From `next/navigation` |

### Architecture Compliance

**Project Structure** [Source: architecture.md#5]:
```
apps/web/src/
├── app/
│   ├── (dashboard)/          # Route group for authenticated pages
│   │   ├── layout.tsx        # THIS STORY: dashboard shell layout
│   │   ├── page.tsx          # Dashboard home placeholder
│   │   ├── products/
│   │   │   └── page.tsx      # Placeholder
│   │   ├── competitors/
│   │   │   └── page.tsx      # Placeholder
│   │   ├── alerts/
│   │   │   └── page.tsx      # Placeholder
│   │   ├── reports/
│   │   │   └── page.tsx      # Placeholder
│   │   └── settings/
│   │       └── page.tsx      # Placeholder
│   └── layout.tsx            # Root layout (from Story 1.1)
├── components/
│   ├── layout/               # THIS STORY: new directory
│   │   ├── sidebar.tsx       # Sidebar component
│   │   ├── breadcrumbs.tsx   # Breadcrumb component
│   │   ├── mobile-nav.tsx    # Bottom tab bar for mobile
│   │   └── app-shell.tsx     # Optional wrapper composing sidebar + content
│   └── ui/                   # shadcn/ui components (from Story 1.1)
├── hooks/
│   └── use-sidebar.ts        # Optional: sidebar state hook
├── lib/
└── stores/
    └── sidebar-store.ts      # Optional: Zustand store for sidebar state
```

**Naming Conventions** [Source: architecture.md#7.1]:
- TypeScript files: kebab-case (`sidebar.tsx`, `breadcrumbs.tsx`, `mobile-nav.tsx`)
- React components: PascalCase exports (`Sidebar`, `Breadcrumbs`, `MobileNav`)
- Keep all layout components in `src/components/layout/`

### Sidebar Specifications

**Expanded (desktop, >=768px):**
- Width: 240px fixed
- Background: `bg-card` or `bg-sidebar` (define a subtle background)
- Nav items: icon (20px) + label text, 12px gap between icon and label
- Active item: `bg-accent text-accent-foreground` or `bg-primary/10 text-primary`
- Settings item: pinned to bottom of sidebar, separated by a divider or spacer

**Collapsed:**
- Width: 64px
- Icons centered horizontally
- Labels hidden; show label via Tooltip on hover (use shadcn/ui `Tooltip`)
- Toggle button switches between `ChevronLeft` (collapse) and `ChevronRight` (expand)

**Transition:**
- Use `transition-all duration-200` for smooth width animation
- Sidebar content should not overflow during transition — use `overflow-hidden`

### UX Requirements

[Source: ux-spec.md#2, #5, #7, #9]:

**Navigation items and icons:**
- Dashboard → `LayoutDashboard` (Home icon in IA)
- Products → `Package` (Package icon in IA)
- Competitors → `Users` (Users icon in IA)
- Alerts → `Bell` (Bell icon in IA — will have unread badge in future Story 7.3)
- Reports → `BarChart3` (BarChart icon in IA)
- Settings → `Settings` (Gear icon in IA — bottom of sidebar)

**Breadcrumb format:** `Dashboard / [Section] / [Item Name]`
- Show on all pages except Dashboard root
- Last segment is non-linked current page

**Responsive breakpoints** [Source: ux-spec.md#4.1]:
- Desktop (>=1280px): full sidebar + two-column content (content columns are later stories' concern)
- Tablet (768-1279px): collapsible sidebar + single-column content
- Mobile (<768px): bottom tab bar replaces sidebar

**Spacing** [Source: ux-spec.md#5]:
- Content max-width: 1440px, centered
- Sidebar: 240px fixed, collapsible to 64px
- Page padding: 24px (Tailwind `p-6`)
- Base unit: 4px (Tailwind default)

### Accessibility Requirements

[Source: ux-spec.md#7]:

- **Keyboard navigation**: All nav items must be reachable via Tab key with visible focus rings
- **Skip-to-content**: `<a>` link as the first focusable element in the page; visually hidden but appears on focus
- **ARIA**: 
  - Sidebar: `<nav aria-label="Main navigation">`
  - Breadcrumbs: `<nav aria-label="Breadcrumb">` with `<ol>` list
  - Active nav item: `aria-current="page"`
  - Toggle button: `aria-label="Collapse sidebar"` / `aria-label="Expand sidebar"`
  - Toggle button: `aria-expanded="true"` / `aria-expanded="false"`
- **Focus rings**: Use `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- **Contrast**: Ensure sidebar text meets 4.5:1 contrast ratio against sidebar background
- **Motion**: Sidebar collapse animation should respect `prefers-reduced-motion` (`motion-reduce:transition-none`)

### Previous Story (1.1) Intelligence

Story 1.1 establishes:
- The root layout at `apps/web/src/app/layout.tsx` with Inter font and global Tailwind styles
- shadcn/ui at `src/components/ui/` — reuse these components (Button, Tooltip, etc.)
- Color tokens for prices (not directly used in this story, but available)
- `tabular-nums` utility available for future number displays

**Key patterns from Story 1.1 to follow:**
- Components use `"use client"` directive when they need hooks or browser APIs
- Imports follow the `@/` alias pattern (e.g., `@/components/ui/button`)
- The `cn()` utility from shadcn/ui is available for conditional class merging

### What NOT to Do

- Do NOT implement authentication or protected routes — Story 1.3 handles auth
- Do NOT add the command palette (Cmd+K) — Story 1.4 handles that
- Do NOT install new heavy dependencies (React Query, Recharts, etc.) — not needed for this story
- Do NOT create product/competitor/alert data models or API calls — future epics
- Do NOT implement the actual dashboard content (KPI cards, charts, feed) — Story 8.1
- Do NOT add alert badge count to the Alerts nav item — Story 7.3
- Do NOT implement a dark mode toggle unless the design system already supports it
- Keep Zustand usage minimal — only for sidebar collapse state

### Testing Guidance

- Verify sidebar renders correctly at 240px and collapses to 64px
- Verify navigation between all 6 routes works without errors
- Verify breadcrumbs update correctly on each page
- Verify mobile bottom tab bar appears below 768px breakpoint
- Verify skip-to-content link is focusable and jumps to main content
- Verify keyboard Tab navigation through all sidebar items
- Verify `aria-current="page"` on the active nav item
- Run `npm run build` — zero errors
- Check Lighthouse accessibility score remains >= 90

### References

- [Source: architecture.md#2.1] — Frontend technology stack (Next.js, Tailwind, shadcn/ui)
- [Source: architecture.md#5] — Project structure specification (apps/web/src/components/layout/)
- [Source: architecture.md#7.1] — Naming conventions (kebab-case files, PascalCase components)
- [Source: architecture.md#7.4] — Component structure pattern (hooks → state → handlers → render)
- [Source: ux-spec.md#2] — Information Architecture (navigation structure)
- [Source: ux-spec.md#5] — Design system: spacing, sidebar width, content max-width
- [Source: ux-spec.md#7] — Accessibility requirements (WCAG 2.1 AA)
- [Source: ux-spec.md#9] — Navigation & wayfinding (sidebar items, breadcrumbs, icons)
- [Source: ux-spec.md#10] — Mobile considerations (bottom tab bar)
- [Source: epics-and-stories.md#Epic1-Story1.2] — Story acceptance criteria
- [Source: prd.md#6] — Technical architecture summary
- [Source: brief.md#6] — High-level architecture

## Dev Agent Record

### Agent Model Used
Claude claude-4.6-opus-high-thinking

### Debug Log References
- Build: `npm run build` — zero errors, all 7 routes generated as static content
- Tests: `npm test` — 27 passed, 0 failed across 5 test files

### Completion Notes List
- Initialized Next.js 16 project with TypeScript, Tailwind CSS 4, and shadcn/ui (Story 1.1 prerequisite not yet merged)
- Created dashboard layout with flex row structure: sidebar (left) + main content (right, max-w-[1440px], p-6)
- Built Sidebar component with 6 nav items using Lucide icons, expanded (240px/w-60) and collapsed (64px/w-16) modes
- Zustand persist middleware stores sidebar collapse state in localStorage
- Tooltips appear on hover in collapsed mode using shadcn/ui Tooltip
- Active route detection via `usePathname()` with `aria-current="page"` and `bg-accent` styling
- Breadcrumbs auto-generated from URL path, hidden on dashboard root, with de-slugification
- Mobile bottom tab bar (5 items, no Settings) with `fixed bottom-0 z-50` and top border
- Skip-to-content link as first focusable element, visible on focus
- Main content has `id="main-content"` and `tabindex="-1"` for skip navigation
- All nav items have `focus-visible:ring-2` focus rings and respect `prefers-reduced-motion`
- Created 6 placeholder pages under `(dashboard)` route group

### Change Log
- 2026-03-31: Implemented Story 1.2 — full app shell with sidebar, breadcrumbs, mobile nav, accessibility, and placeholder pages

### File List
- apps/web/src/app/layout.tsx (modified — Inter font, TooltipProvider, metadata)
- apps/web/src/app/globals.css (generated by shadcn/ui init)
- apps/web/src/app/(dashboard)/layout.tsx (new — dashboard shell layout)
- apps/web/src/app/(dashboard)/page.tsx (new — dashboard placeholder)
- apps/web/src/app/(dashboard)/products/page.tsx (new — products placeholder)
- apps/web/src/app/(dashboard)/competitors/page.tsx (new — competitors placeholder)
- apps/web/src/app/(dashboard)/alerts/page.tsx (new — alerts placeholder)
- apps/web/src/app/(dashboard)/reports/page.tsx (new — reports placeholder)
- apps/web/src/app/(dashboard)/settings/page.tsx (new — settings placeholder)
- apps/web/src/components/layout/sidebar.tsx (new — sidebar with collapse/expand)
- apps/web/src/components/layout/breadcrumbs.tsx (new — auto-breadcrumbs from URL)
- apps/web/src/components/layout/mobile-nav.tsx (new — mobile bottom tab bar)
- apps/web/src/components/layout/nav-items.ts (new — shared nav item definitions)
- apps/web/src/components/ui/tooltip.tsx (new — shadcn/ui tooltip)
- apps/web/src/components/ui/breadcrumb.tsx (new — shadcn/ui breadcrumb)
- apps/web/src/components/ui/button.tsx (new — shadcn/ui button)
- apps/web/src/stores/sidebar-store.ts (new — Zustand sidebar state)
- apps/web/src/lib/utils.ts (new — cn utility)
- apps/web/src/__tests__/setup.ts (new — test setup)
- apps/web/src/__tests__/sidebar.test.tsx (new — 9 sidebar tests)
- apps/web/src/__tests__/breadcrumbs.test.tsx (new — 7 breadcrumb tests)
- apps/web/src/__tests__/mobile-nav.test.tsx (new — 3 mobile nav tests)
- apps/web/src/__tests__/sidebar-store.test.ts (new — 3 store tests)
- apps/web/src/__tests__/nav-items.test.ts (new — 5 nav items tests)
- apps/web/vitest.config.ts (new — Vitest configuration)
- apps/web/package.json (modified — test scripts, dependencies)

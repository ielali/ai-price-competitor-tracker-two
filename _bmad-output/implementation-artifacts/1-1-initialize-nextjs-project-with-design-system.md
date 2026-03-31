# Story 1.1: Initialize Next.js Project with Design System

Status: ready-for-dev

## Story

As a **developer setting up the project foundation**,
I want to bootstrap the Next.js application with the correct tech stack, design tokens, and tooling,
so that all subsequent features are built on a consistent, accessible, and well-structured codebase.

## Acceptance Criteria

1. Next.js 14+ app created with App Router, TypeScript strict mode enabled
2. Tailwind CSS configured with custom color tokens: `price-down` (green-500 #22c55e), `price-up` (red-500 #ef4444), `stable` (gray-400 #9ca3af), `anomaly` (amber-500 #f59e0b), `user-price` (blue-600 #2563eb)
3. shadcn/ui installed with at least Button, Input, Dialog, Toast, Table components available
4. Inter font loaded via `next/font/google` with tabular-numerals variant available for price displays
5. ESLint and Prettier configured with consistent, non-conflicting rules
6. Base unit spacing (4px) configured in Tailwind theme
7. `npm run build` completes with zero errors
8. Lighthouse accessibility score >= 90 on the empty shell

## Tasks / Subtasks

- [ ] Task 1: Scaffold Turborepo monorepo with Next.js at `apps/web/` (AC: #1)
  - [ ] Create root `package.json` with `workspaces: ["apps/*", "packages/*"]`
  - [ ] Create root `turbo.json` with pipeline config for `build`, `lint`, `dev`
  - [ ] Run `npx create-next-app@latest apps/web` with App Router, TypeScript, Tailwind, ESLint, `src/` directory, import alias `@/`
  - [ ] Confirm `apps/web/tsconfig.json` has `"strict": true`
  - [ ] Create `tsconfig.base.json` at repo root for shared TS config
  - [ ] Create stub directories: `apps/api/` (empty), `packages/shared/` (empty), `packages/scraper/` (empty) — just `.gitkeep` files to reserve the monorepo structure

- [ ] Task 2: Configure Tailwind CSS with custom design tokens (AC: #2, #6)
  - [ ] Edit `apps/web/tailwind.config.ts` to extend `theme.colors` with:
    - `'price-down': '#22c55e'` (green-500)
    - `'price-up': '#ef4444'` (red-500)
    - `'stable': '#9ca3af'` (gray-400)
    - `'anomaly': '#f59e0b'` (amber-500)
    - `'user-price': '#2563eb'` (blue-600)
  - [ ] Tailwind default spacing already uses 4px base (`1` = 0.25rem = 4px) — confirm and document
  - [ ] Add max-width `1440px` token: `theme.extend.maxWidth: { 'content': '1440px' }`
  - [ ] Verify Tailwind classes render correctly on a test element

- [ ] Task 3: Install and configure shadcn/ui (AC: #3)
  - [ ] Run `npx shadcn@latest init` inside `apps/web/`
  - [ ] Accept defaults: style "default", base color "neutral", CSS variables enabled
  - [ ] Install components: `npx shadcn@latest add button input dialog toast table`
  - [ ] Confirm components exist at `apps/web/src/components/ui/`
  - [ ] Verify a Button renders without errors in `page.tsx`

- [ ] Task 4: Load Inter font with tabular-numerals support (AC: #4)
  - [ ] In `apps/web/src/app/layout.tsx`, use `next/font/google` to import Inter
  - [ ] Apply Inter as the default body font via className on `<html>` or `<body>`
  - [ ] Tailwind already provides `tabular-nums` utility class — verify it works
  - [ ] Optionally add a `.font-tabular` CSS alias that applies `font-variant-numeric: tabular-nums`

- [ ] Task 5: Configure ESLint + Prettier (AC: #5)
  - [ ] Configure ESLint with `next/core-web-vitals` + `@typescript-eslint/recommended`
  - [ ] Install Prettier: `prettier`, `eslint-config-prettier`
  - [ ] Create `.prettierrc` with: `{ "semi": true, "singleQuote": true, "trailingComma": "all", "printWidth": 100 }`
  - [ ] Add scripts: `"lint": "next lint"`, `"format": "prettier --write \"src/**/*.{ts,tsx,css}\""` to `apps/web/package.json`
  - [ ] Verify `npm run lint` passes with zero warnings

- [ ] Task 6: Build verification and accessibility baseline (AC: #7, #8)
  - [ ] Ensure `<html lang="en">` attribute is set in root layout
  - [ ] Ensure viewport meta tag is present (Next.js adds this by default)
  - [ ] Run `npm run build` from `apps/web/` — must succeed with zero errors
  - [ ] Run Lighthouse accessibility audit — score must be >= 90
  - [ ] Verify zero console errors on initial page load

## Dev Notes

### Technical Stack Decisions

| Technology | Version/Spec | Notes |
|------------|-------------|-------|
| Next.js | 14+ (App Router) | Use `app/` directory, not `pages/` |
| TypeScript | Strict mode | `"strict": true` in tsconfig |
| Tailwind CSS | v3+ | TypeScript config: `tailwind.config.ts` |
| shadcn/ui | Latest | Default style, CSS variables enabled |
| Inter font | via `next/font/google` | Optimized, no external CSS link |
| Turborepo | Latest | Monorepo orchestration |

[Source: architecture.md#2.1 — Frontend technology stack]

### Architecture-Mandated Project Structure

The architecture document mandates a Turborepo monorepo. This story creates the `apps/web/` portion:

```
ai-competitor-price-tracker/
├── apps/
│   ├── web/                          # Next.js frontend ← THIS STORY
│   │   ├── src/
│   │   │   ├── app/                  # App Router pages
│   │   │   │   ├── layout.tsx        # Root layout (Inter font, global CSS)
│   │   │   │   └── page.tsx          # Placeholder home page
│   │   │   ├── components/
│   │   │   │   └── ui/               # shadcn/ui components
│   │   │   ├── hooks/                # Custom React hooks (empty for now)
│   │   │   ├── lib/                  # Utilities (empty for now)
│   │   │   └── stores/               # Zustand stores (empty for now)
│   │   ├── public/
│   │   ├── tailwind.config.ts
│   │   ├── next.config.ts
│   │   ├── components.json           # shadcn/ui config
│   │   └── package.json
│   └── api/                          # Stub only (.gitkeep)
├── packages/
│   ├── shared/                       # Stub only (.gitkeep)
│   └── scraper/                      # Stub only (.gitkeep)
├── turbo.json
├── package.json                      # Root workspace
├── tsconfig.base.json
├── .eslintrc.json
├── .prettierrc
└── README.md
```

[Source: architecture.md#5 — Project structure]

### Naming Conventions

| Context | Convention | Example |
|---------|-----------|---------|
| TypeScript files | kebab-case | `price-history-chart.tsx` |
| React components | PascalCase | `PriceHistoryChart` |
| TypeScript types | PascalCase | `Product`, `AlertRule` |
| Environment vars | SCREAMING_SNAKE | `DATABASE_URL` |
| CSS classes | Tailwind utility-first | `text-sm font-medium` |

[Source: architecture.md#7.1 — Naming conventions]

### Design Token Details

**Custom color tokens** must be added to both Tailwind config and CSS variables (shadcn/ui uses CSS variables):

| Token | Hex | Tailwind Equiv | Usage |
|-------|-----|----------------|-------|
| `price-down` | #22c55e | green-500 | Competitor price decreasing (favorable) |
| `price-up` | #ef4444 | red-500 | Competitor price increasing |
| `stable` | #9ca3af | gray-400 | No significant change |
| `anomaly` | #f59e0b | amber-500 | Unusual price activity |
| `user-price` | #2563eb | blue-600 | User's own price on charts |

**Typography**:
- Font: Inter (Google Fonts via `next/font/google`)
- Headings: semibold
- Body: regular, 14px base
- Data/Numbers: `tabular-nums` for price alignment in tables/charts
- Small/Labels: 12px, medium weight

**Spacing**:
- Base unit: 4px (Tailwind default: `1` = 0.25rem = 4px — no custom config needed)
- Content max-width: 1440px (add as custom token)
- Page padding: 24px (6 in Tailwind units) — used in Story 1.2 but good to note

[Source: ux-spec.md#5 — Design System Requirements]

### Accessibility Requirements

- WCAG 2.1 AA compliance is required across the whole app
- `<html lang="en">` attribute mandatory
- Minimum contrast ratio: 4.5:1 for text, 3:1 for UI components
- All color-coded indicators must be paired with text/icons (not color-only)
- Respect `prefers-reduced-motion` media query
- Lighthouse accessibility score >= 90

[Source: ux-spec.md#7 — Accessibility Requirements]

### shadcn/ui Configuration Notes

- Run init from `apps/web/` directory, not repo root
- When prompted for framework, select Next.js
- When prompted for components location, use `src/components/ui`
- shadcn/ui creates a `lib/utils.ts` with a `cn()` function (Tailwind class merge utility) — keep it
- The `components.json` file configures import aliases and paths
- Ensure the import alias `@/` maps to `apps/web/src/` in tsconfig

### What This Story Does NOT Include

- No sidebar layout or navigation (Story 1.2)
- No authentication (Story 1.3)
- No backend/API setup (Epic 4+)
- No Recharts, TanStack Query, Zustand, TanStack Table, or React Hook Form (install when needed)
- No Docker/CI/CD (Epic 10)
- No database schemas (backend concern)
- Keep the initial page minimal — a branded placeholder is sufficient

### Potential Pitfalls

1. **Monorepo complexity**: If Turborepo + workspaces cause issues with shadcn/ui init or Next.js config, prioritize getting the Next.js app working at `apps/web/` first, then fix workspace resolution
2. **shadcn/ui + Tailwind v4**: If Tailwind v4 is the latest, shadcn/ui may need specific compatibility — check latest shadcn docs. Tailwind v3 is the safe choice if v4 has breaking changes
3. **ESLint flat config**: Next.js may ship with flat config (`eslint.config.mjs`). Use whatever `create-next-app` generates, then extend
4. **CSS variable conflicts**: shadcn/ui injects its own CSS variables. Custom color tokens should be added alongside, not replacing shadcn defaults

### References

- [Source: architecture.md#2.1] — Frontend technology stack decisions
- [Source: architecture.md#5] — Full project structure specification
- [Source: architecture.md#7.1] — Naming conventions
- [Source: ux-spec.md#5] — Design system component library, colors, typography, spacing
- [Source: ux-spec.md#7] — WCAG 2.1 AA accessibility requirements
- [Source: ux-spec.md#8] — Performance UX targets
- [Source: epics-and-stories.md#Epic1-Story1.1] — Story acceptance criteria
- [Source: prd.md#6] — Technical architecture summary table
- [Source: brief.md#6] — High-level technical architecture

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

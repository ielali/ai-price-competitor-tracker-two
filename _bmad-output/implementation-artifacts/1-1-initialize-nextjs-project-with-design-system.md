# Story 1.1: Initialize Next.js Project with Design System

Status: ready-for-dev

## Story

As a **developer setting up the project foundation**,
I want to bootstrap the Next.js application with the correct tech stack, design tokens, and tooling configuration,
so that all subsequent features can be built on a consistent, accessible, and well-structured foundation.

## Acceptance Criteria

1. Next.js 14+ app created with App Router, TypeScript strict mode enabled
2. Tailwind CSS configured with custom color tokens: price-down (green-500), price-up (red-500), stable (gray-400), anomaly (amber-500), user-price (blue-600)
3. shadcn/ui installed and at least Button, Input, Dialog, Toast, Table components available
4. Inter font loaded with tabular-numerals variant available for price displays
5. ESLint and Prettier configured with consistent rules
6. Base unit spacing (4px) configured in Tailwind theme
7. `npm run build` completes without errors
8. Lighthouse accessibility score >= 90 on empty shell

## Tasks / Subtasks

- [ ] Task 1: Initialize Next.js project with TypeScript (AC: #1)
  - [ ] Run `npx create-next-app@latest` with App Router and TypeScript enabled
  - [ ] Verify `tsconfig.json` has `"strict": true`
  - [ ] Set up the monorepo structure: `apps/web/` for Next.js (per architecture spec)
  - [ ] Configure `turbo.json` for Turborepo if monorepo, or defer monorepo setup to later story

- [ ] Task 2: Configure Tailwind CSS with design system tokens (AC: #2, #6)
  - [ ] Install Tailwind CSS and configure `tailwind.config.ts`
  - [ ] Add custom color tokens to `theme.extend.colors`:
    ```
    'price-down': colors.green[500]    // #22c55e
    'price-up': colors.red[500]        // #ef4444
    'stable': colors.gray[400]         // #9ca3af
    'anomaly': colors.amber[500]       // #f59e0b
    'user-price': colors.blue[600]     // #2563eb
    ```
  - [ ] Set base spacing unit to 4px in Tailwind config (`theme.spacing` base)
  - [ ] Verify Tailwind is working by adding a test class in a page

- [ ] Task 3: Install and configure shadcn/ui (AC: #3)
  - [ ] Run `npx shadcn@latest init` with default configuration
  - [ ] Install required components: `npx shadcn@latest add button input dialog toast table`
  - [ ] Verify components are accessible at `src/components/ui/`
  - [ ] Confirm components render correctly with a simple test page

- [ ] Task 4: Configure Inter font with tabular numerals (AC: #4)
  - [ ] Use `next/font/google` to load Inter font
  - [ ] Configure `font-feature-settings: "tnum"` for tabular numerals
  - [ ] Create a CSS utility class `.tabular-nums` (or use Tailwind's `tabular-nums`)
  - [ ] Apply Inter as the default font in layout.tsx

- [ ] Task 5: Set up ESLint and Prettier (AC: #5)
  - [ ] Configure ESLint with Next.js recommended rules + TypeScript rules
  - [ ] Install and configure Prettier with consistent settings (semi, singleQuote, trailingComma)
  - [ ] Add `.eslintrc.json` and `.prettierrc` config files
  - [ ] Add `npm run lint` and `npm run format` scripts to package.json
  - [ ] Ensure ESLint and Prettier do not conflict (use `eslint-config-prettier`)

- [ ] Task 6: Verify build and accessibility (AC: #7, #8)
  - [ ] Run `npm run build` — must complete with zero errors
  - [ ] Run Lighthouse audit on dev server — accessibility score must be >= 90
  - [ ] Add proper `<html lang="en">` attribute
  - [ ] Ensure viewport meta tag is present
  - [ ] Verify no console errors on initial page load

## Dev Notes

### Technical Stack (from Architecture Document)

| Technology | Version/Detail | Source |
|------------|---------------|--------|
| Next.js | 14+ with App Router | [Source: architecture.md#2.1] |
| TypeScript | Strict mode | [Source: architecture.md#2.1] |
| Tailwind CSS | Latest + shadcn/ui | [Source: architecture.md#2.1] |
| shadcn/ui | Component library | [Source: architecture.md#2.1] |
| Recharts | For charts (not needed in this story) | [Source: architecture.md#2.1] |
| React Hook Form + Zod | Forms (not needed in this story) | [Source: architecture.md#2.1] |
| TanStack Query | Server state (not needed in this story) | [Source: architecture.md#2.1] |
| Zustand | Client state (not needed in this story) | [Source: architecture.md#2.1] |
| TanStack Table | Data tables (not needed in this story) | [Source: architecture.md#2.1] |

### Architecture Compliance

**Project Structure** (from [Source: architecture.md#5]):
```
ai-competitor-price-tracker/
├── apps/
│   ├── web/                          # Next.js frontend <-- THIS STORY
│   │   ├── src/
│   │   │   ├── app/                  # App Router pages
│   │   │   ├── components/
│   │   │   │   ├── ui/               # shadcn/ui components
│   │   │   │   ├── charts/           # Recharts wrappers (later)
│   │   │   │   ├── forms/            # Form components (later)
│   │   │   │   ├── tables/           # Data table components (later)
│   │   │   │   └── layout/           # Shell, sidebar, breadcrumbs (Story 1.2)
│   │   │   ├── hooks/                # Custom React hooks
│   │   │   ├── lib/                  # Utilities, API client
│   │   │   └── stores/               # Zustand stores
│   │   ├── public/
│   │   ├── tailwind.config.ts
│   │   ├── next.config.ts
│   │   └── package.json
├── turbo.json                        # Turborepo config
├── package.json                      # Root workspace
└── tsconfig.base.json                # Shared TS config
```

**IMPORTANT decisions for this story:**
- The architecture specifies a **Turborepo monorepo** structure. For this foundation story, set up `apps/web/` as the Next.js app location. The `apps/api/`, `packages/shared/`, and `packages/scraper/` directories will be created in later stories.
- If monorepo setup adds significant complexity, a simpler approach is acceptable for MVP: create the Next.js app at root level and restructure later. However, the monorepo is the target architecture.
- shadcn/ui components go in `src/components/ui/` — this is the standard shadcn convention and matches the architecture spec.

### Naming Conventions (from [Source: architecture.md#7.1])

| Context | Convention | Example |
|---------|-----------|---------|
| TypeScript files | kebab-case | `product.service.ts`, `price-history-chart.tsx` |
| React components | PascalCase | `PriceHistoryChart`, `ProductWizard` |
| TypeScript types | PascalCase | `Product`, `AlertRule` |
| Environment vars | SCREAMING_SNAKE | `DATABASE_URL`, `REDIS_URL` |
| CSS classes | Tailwind utility | `text-sm font-medium text-gray-900` |

### Design System Tokens (from [Source: ux-spec.md#1, epics.md#1.1])

**Color Palette:**
- `price-down`: green-500 (#22c55e) — competitor price decreasing
- `price-up`: red-500 (#ef4444) — competitor price increasing
- `stable`: gray-400 (#9ca3af) — no significant change
- `anomaly`: amber-500 (#f59e0b) — unusual price activity
- `user-price`: blue-600 (#2563eb) — user's own price line on charts

**Typography:**
- Primary font: Inter (Google Fonts)
- Price displays: `font-variant-numeric: tabular-nums` for visual alignment in tables/charts
- Tailwind provides `tabular-nums` utility class natively

**Spacing:**
- Base unit: 4px (Tailwind default already uses 4px base: `1` = 0.25rem = 4px)
- Content area: max-width 1440px, centered, 24px padding (Story 1.2 concern but be aware)

### UX Requirements Relevant to This Story

- **WCAG 2.1 AA** accessibility compliance is required across the whole app [Source: architecture.md#1]
- Lighthouse accessibility score >= 90 on empty shell [Source: epics.md#1.1]
- `<html lang="en">` must be set [Source: WCAG requirement]
- Skip-to-content link is a Story 1.2 concern but good to add early

### Library/Framework Specifics

**Next.js 14+ App Router:**
- Use the `app/` directory (not `pages/`)
- `layout.tsx` for root layout with font and global styles
- `page.tsx` for the home page (can be a minimal placeholder)
- Use `next/font/google` for optimized font loading (no external CSS link needed)

**shadcn/ui Setup:**
- Initialize with: `npx shadcn@latest init`
- Will create `components.json` configuration file
- Default style: "default" or "new-york" — use "default" unless UX spec indicates otherwise
- Components installed individually: `npx shadcn@latest add button input dialog toast table`
- shadcn/ui uses Tailwind CSS variables for theming — the custom color tokens should be added to CSS variables as well as Tailwind config

**Tailwind CSS v3+:**
- `tailwind.config.ts` (TypeScript config file)
- Content paths must include `./src/**/*.{ts,tsx}`
- PostCSS configuration required

### What NOT to Do in This Story

- Do NOT set up the backend (Fastify API) — that's a separate epic
- Do NOT install Recharts, TanStack Query, Zustand, TanStack Table, or React Hook Form yet — install only when their story is in progress
- Do NOT create the sidebar layout or navigation — that's Story 1.2
- Do NOT implement authentication — that's Story 1.3
- Do NOT set up Docker or CI/CD — that's Epic 10
- Do NOT create database schemas — that's a backend concern
- Keep the initial page minimal (a placeholder is fine)

### Project Structure Notes

- This story establishes the `apps/web/` directory as the frontend home
- All component paths follow the architecture spec's folder structure
- The `src/` directory convention is used within `apps/web/`
- Tailwind config at `apps/web/tailwind.config.ts`
- Next.js config at `apps/web/next.config.ts`

### References

- [Source: architecture.md#2.1] — Frontend technology stack decisions
- [Source: architecture.md#5] — Project structure specification
- [Source: architecture.md#7.1] — Naming conventions
- [Source: ux-spec.md#1] — UX vision and design principles
- [Source: ux-spec.md#4.1] — Dashboard layout specs (for awareness, not implementation)
- [Source: epics-and-stories.md#Epic1-Story1.1] — Story acceptance criteria
- [Source: prd.md#6] — Technical architecture summary
- [Source: brief.md#6] — High-level technical architecture

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

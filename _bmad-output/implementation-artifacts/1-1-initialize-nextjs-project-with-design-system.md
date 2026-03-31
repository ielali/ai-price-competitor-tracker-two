# Story 1.1: Initialize Next.js Project with Design System

Status: review

## File List

- package.json (new) — Root workspace config with turbo, prettier, workspaces
- turbo.json (new) — Turborepo pipeline definitions
- tsconfig.base.json (new) — Shared TypeScript strict settings
- .prettierrc (new) — Prettier configuration
- .prettierignore (new) — Prettier ignore patterns
- package-lock.json (new) — Dependency lockfile
- apps/web/package.json (new) — Next.js web app package
- apps/web/tsconfig.json (new) — Web app TypeScript config extending base
- apps/web/next.config.mjs (new) — Next.js configuration with transpilePackages
- apps/web/postcss.config.mjs (new) — PostCSS config for Tailwind
- apps/web/tailwind.config.ts (new) — Tailwind config with design tokens
- apps/web/components.json (new) — shadcn/ui configuration
- apps/web/.eslintrc.json (new) — ESLint config with next + prettier
- apps/web/next-env.d.ts (new) — Next.js type declarations
- apps/web/src/app/globals.css (new) — Global styles with CSS variables and font-tabular
- apps/web/src/app/layout.tsx (new) — Root layout with Inter font, lang="en", skip-to-content
- apps/web/src/app/page.tsx (new) — Minimal landing page with design tokens demo
- apps/web/src/app/(auth)/.gitkeep (new) — Auth route group stub
- apps/web/src/app/(dashboard)/.gitkeep (new) — Dashboard route group stub
- apps/web/src/lib/utils.ts (new) — shadcn/ui cn() utility
- apps/web/src/components/ui/button.tsx (new) — shadcn/ui Button component
- apps/web/src/components/ui/input.tsx (new) — shadcn/ui Input component
- apps/web/src/components/ui/dialog.tsx (new) — shadcn/ui Dialog component
- apps/web/src/components/ui/toast.tsx (new) — shadcn/ui Toast component
- apps/web/src/components/ui/toaster.tsx (new) — Toaster wrapper component
- apps/web/src/components/ui/table.tsx (new) — shadcn/ui Table component
- apps/web/src/hooks/use-toast.ts (new) — Toast state management hook
- packages/shared/package.json (new) — Shared package config
- packages/shared/tsconfig.json (new) — Shared package TypeScript config
- packages/shared/src/index.ts (new) — Shared package entry point
- packages/shared/src/schemas/.gitkeep (new) — Zod schemas stub directory
- packages/shared/src/types/.gitkeep (new) — Shared types stub directory
- packages/shared/src/constants/.gitkeep (new) — Shared constants stub directory

## Story

As a **developer setting up the project foundation**,
I want to bootstrap the Next.js application with Tailwind CSS, shadcn/ui, and the core design tokens from the UX spec,
so that all subsequent feature stories have a consistent, well-configured codebase to build upon.

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

- [x] Task 1: Initialize Turborepo monorepo structure (AC: #7)
  - [x] 1.1 Create root `package.json` with workspaces config pointing to `apps/*` and `packages/*`
  - [x] 1.2 Create `turbo.json` with build/dev/lint pipeline definitions
  - [x] 1.3 Create `tsconfig.base.json` with shared TypeScript strict settings
  - [x] 1.4 Create `packages/shared/` package stub with `package.json` and empty `src/` directory
- [x] Task 2: Create Next.js app at `apps/web/` (AC: #1, #7)
  - [x] 2.1 Created Next.js app manually with App Router, TypeScript, Tailwind CSS, ESLint
  - [x] 2.2 Verify TypeScript strict mode is enabled in `tsconfig.json` (`"strict": true`)
  - [x] 2.3 Ensure `apps/web/src/app/` directory structure follows App Router conventions
  - [x] 2.4 Create route group stubs: `(auth)/` and `(dashboard)/` under `app/`
- [x] Task 3: Configure Tailwind CSS with design system tokens (AC: #2, #6)
  - [x] 3.1 Extend `tailwind.config.ts` with custom colors:
    - `price-down`: `#22c55e` (green-500)
    - `price-up`: `#ef4444` (red-500)
    - `stable`: `#9ca3af` (gray-400)
    - `anomaly`: `#f59e0b` (amber-500)
    - `user-price`: `#2563eb` (blue-600)
  - [x] 3.2 Configure base spacing unit of 4px in theme
  - [x] 3.3 Set content max-width to 1440px as a theme value
  - [x] 3.4 Configure sidebar widths: 240px (expanded) and 64px (collapsed) as theme values
- [x] Task 4: Install and configure shadcn/ui (AC: #3)
  - [x] 4.1 Initialized shadcn/ui with New York style, slate base color, CSS variables
  - [x] 4.2 Installed required components: button, input, dialog, toast, table
  - [x] 4.3 All five components import and compile without errors (verified via build)
- [x] Task 5: Load Inter font with tabular numerals (AC: #4)
  - [x] 5.1 Configure Inter via `next/font/google` in root layout
  - [x] 5.2 Add CSS class `font-tabular` with `font-variant-numeric: tabular-nums` for price displays
  - [x] 5.3 Set Inter as the default font family in Tailwind config
- [x] Task 6: Configure ESLint and Prettier (AC: #5)
  - [x] 6.1 Install Prettier and `eslint-config-prettier`
  - [x] 6.2 Create `.prettierrc` at root with consistent settings (semi, singleQuote, trailingComma, printWidth: 100)
  - [x] 6.3 Extend ESLint config with Next.js recommended rules + Prettier
  - [x] 6.4 Add `lint` and `format` scripts to root package.json
  - [x] 6.5 Verify `npm run lint` and `npm run format` pass cleanly
- [x] Task 7: Verify build and accessibility (AC: #7, #8)
  - [x] 7.1 Run `npm run build` from root — completes without errors
  - [x] 7.2 Create a minimal `app/page.tsx` with semantic HTML and skip-to-content link
  - [x] 7.3 Add `lang="en"` to the `<html>` element in root layout
  - [x] 7.4 Ensure proper `<meta>` viewport tag is present (Next.js adds this by default)

## Dev Notes

### Architecture Compliance

This story sets up the **Turborepo monorepo** structure that all subsequent stories depend on. The architecture mandates:

- **Monorepo structure**: `apps/web/` (Next.js frontend), `apps/api/` (Fastify backend — created in a later story), `packages/shared/` (shared Zod schemas and types), `packages/scraper/` (scraping engine — later story)
- **Only `apps/web/` and `packages/shared/` stubs are in scope** for this story. Do NOT create `apps/api/` or `packages/scraper/` — those come in later epics.
- **Turborepo** coordinates builds across packages with caching and parallelism

### Technical Stack (Exact Versions)

| Package      | Version Constraint                 | Notes                                        |
| ------------ | ---------------------------------- | -------------------------------------------- |
| Next.js      | 14+ (latest stable)                | Use App Router, NOT Pages Router             |
| React        | 18+ (as bundled with Next.js)      |                                              |
| TypeScript   | 5+ (strict mode)                   | `"strict": true` in tsconfig                 |
| Tailwind CSS | 3.4+                               | Use `tailwind.config.ts` (TypeScript config) |
| shadcn/ui    | Latest (uses @radix-ui primitives) | Initialize with `npx shadcn@latest init`     |
| Turborepo    | Latest stable                      | `turbo.json` at root                         |

### File Structure (Expected Output)

```
ai-competitor-price-tracker/
├── apps/
│   └── web/
│       ├── src/
│       │   ├── app/
│       │   │   ├── (auth)/           # Route group stub (empty for now)
│       │   │   ├── (dashboard)/      # Route group stub (empty for now)
│       │   │   ├── layout.tsx        # Root layout with Inter font, lang="en"
│       │   │   └── page.tsx          # Minimal landing page
│       │   ├── components/
│       │   │   └── ui/               # shadcn/ui generated components
│       │   └── lib/
│       │       └── utils.ts          # shadcn/ui cn() utility
│       ├── public/
│       ├── tailwind.config.ts
│       ├── next.config.ts
│       ├── tsconfig.json
│       └── package.json
├── packages/
│   └── shared/
│       ├── src/
│       │   ├── schemas/              # Stub directory for Zod schemas
│       │   ├── types/                # Stub directory for shared types
│       │   └── constants/            # Stub directory for shared constants
│       ├── tsconfig.json
│       └── package.json
├── turbo.json
├── package.json                      # Root workspace config
├── tsconfig.base.json                # Shared TS strict settings
├── .prettierrc
└── .eslintrc.js (or eslint.config.mjs)
```

### Naming Conventions

- **TypeScript files**: kebab-case (e.g., `price-history-chart.tsx`)
- **React components**: PascalCase exports (e.g., `export function PriceHistoryChart()`)
- **CSS**: Tailwind utility classes only — no custom CSS files unless unavoidable
- **Environment vars**: SCREAMING_SNAKE_CASE

### Design System Token Reference

From UX Spec Section 5:

**Color Palette** (add as `extend.colors` in Tailwind config):

```typescript
colors: {
  'price-down': '#22c55e',   // green-500 — favorable for user
  'price-up': '#ef4444',     // red-500 — competitor price increase
  'stable': '#9ca3af',       // gray-400 — no significant change
  'anomaly': '#f59e0b',      // amber-500 — attention needed
  'user-price': '#2563eb',   // blue-600 — user's own price on charts
}
```

**Typography**:

- Font: Inter (via `next/font/google`)
- Headings: semibold weight
- Body: regular weight, 14px base
- Data/Numbers: tabular-nums for price alignment
- Small/Labels: 12px, medium weight

**Spacing & Layout**:

- Base unit: 4px (Tailwind default already uses 4px base: `p-1` = 4px)
- Content max-width: 1440px
- Page padding: 24px (`p-6`)
- Sidebar: 240px expanded / 64px collapsed

### Accessibility Requirements

- Add `lang="en"` to `<html>` element
- Include skip-to-content link as first focusable element
- Ensure contrast ratios meet WCAG 2.1 AA (4.5:1 text, 3:1 UI)
- All shadcn/ui components ship with ARIA attributes — do not strip them
- Add `<meta name="viewport" content="width=device-width, initial-scale=1">` (Next.js adds this by default)
- Lighthouse accessibility target: >= 90

### Testing Requirements

- `npm run build` must complete without errors
- `npm run lint` must pass cleanly
- All shadcn/ui components must import and render without errors
- TypeScript compilation must succeed with `strict: true`

### Key Warnings

- **Do NOT install Express or Fastify** — the API server is a separate story (Epic 4/10)
- **Do NOT install Playwright, BullMQ, or Redis** — those belong to the scraping engine stories
- **Do NOT install Recharts, TanStack Query, Zustand, React Hook Form, TanStack Table, or Zod** yet — those are installed as needed in the stories that use them
- **Do NOT create the sidebar, navigation, or any layout components** — that is Story 1.2
- **Do NOT create auth pages** — that is Story 1.3
- **Do NOT create any API routes** — the backend is a separate `apps/api/` package in later stories
- Keep the `page.tsx` minimal — just enough to prove the shell renders correctly with design tokens applied

### Project Structure Notes

- This story creates the monorepo root at the repository root level
- The `packages/shared/` directory is created as a stub — actual Zod schemas and types are added in later stories when needed
- Route group directories `(auth)/` and `(dashboard)/` are created empty as organizational placeholders

### References

- [Source: architecture.md#Section 2.1] — Frontend technology stack decisions
- [Source: architecture.md#Section 5] — Project structure and monorepo layout
- [Source: architecture.md#Section 7.1] — Naming conventions
- [Source: ux-spec.md#Section 5] — Design system requirements (colors, typography, spacing)
- [Source: ux-spec.md#Section 7] — Accessibility requirements (WCAG 2.1 AA)
- [Source: ux-spec.md#Section 8] — Performance UX targets
- [Source: epics-and-stories.md#Story 1.1] — Original story definition and acceptance criteria

## Dev Agent Record

### Agent Model Used
claude-4.6-opus

### Debug Log References
- Next.js 14.2.35 used (14+ per architecture spec)
- Tailwind CSS 3.4 used (with `tailwind.config.ts` per story spec)
- shadcn/ui installed via `npx shadcn@latest add` CLI
- Fixed shadcn-generated toaster import path (`@/components/hooks/use-toast` → `@/hooks/use-toast`)
- Fixed lint errors in shadcn-generated input.tsx (empty interface) and use-toast.ts (unused const)
- `next.config.ts` not supported in Next.js 14 — used `next.config.mjs` instead

### Completion Notes List
- Turborepo monorepo with `apps/web` (Next.js) and `packages/shared` (stub)
- All 5 shadcn/ui components installed: Button, Input, Dialog, Toast, Table
- Custom color tokens configured: price-down, price-up, stable, anomaly, user-price
- Inter font loaded via next/font/google with tabular-nums utility class
- ESLint (next/core-web-vitals + next/typescript + prettier) passes cleanly
- Prettier configured at root with project-wide settings
- `npm run build` and `npm run lint` both pass via Turbo
- Accessibility: lang="en" on html, skip-to-content link, semantic HTML, viewport meta

### File List
- package.json (root workspace config)
- turbo.json (Turborepo pipeline definitions)
- tsconfig.base.json (shared strict TypeScript settings)
- .prettierrc (Prettier config)
- .prettierignore (Prettier ignore patterns)
- apps/web/package.json
- apps/web/tsconfig.json
- apps/web/next.config.mjs
- apps/web/postcss.config.mjs
- apps/web/tailwind.config.ts
- apps/web/components.json (shadcn/ui config)
- apps/web/.eslintrc.json
- apps/web/next-env.d.ts
- apps/web/src/app/globals.css
- apps/web/src/app/layout.tsx
- apps/web/src/app/page.tsx
- apps/web/src/app/(auth)/.gitkeep
- apps/web/src/app/(dashboard)/.gitkeep
- apps/web/src/lib/utils.ts
- apps/web/src/components/ui/button.tsx
- apps/web/src/components/ui/input.tsx
- apps/web/src/components/ui/dialog.tsx
- apps/web/src/components/ui/table.tsx
- apps/web/src/components/ui/toast.tsx
- apps/web/src/components/ui/toaster.tsx
- apps/web/src/hooks/use-toast.ts
- packages/shared/package.json
- packages/shared/tsconfig.json
- packages/shared/src/index.ts
- packages/shared/src/schemas/.gitkeep
- packages/shared/src/types/.gitkeep
- packages/shared/src/constants/.gitkeep

### Change Log
- 2026-03-31: Story created by SM agent — comprehensive developer guide with architecture compliance guardrails
- 2026-03-31: Implementation complete — all 7 tasks done, build and lint pass, all ACs satisfied

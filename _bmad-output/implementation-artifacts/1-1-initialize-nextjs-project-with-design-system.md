# Story 1.1: Initialize Next.js Project with Design System

Status: ready-for-dev

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

- [ ] Task 1: Initialize Turborepo monorepo structure (AC: #7)
  - [ ] 1.1 Create root `package.json` with workspaces config pointing to `apps/*` and `packages/*`
  - [ ] 1.2 Create `turbo.json` with build/dev/lint pipeline definitions
  - [ ] 1.3 Create `tsconfig.base.json` with shared TypeScript strict settings
  - [ ] 1.4 Create `packages/shared/` package stub with `package.json` and empty `src/` directory
- [ ] Task 2: Create Next.js app at `apps/web/` (AC: #1, #7)
  - [ ] 2.1 Run `npx create-next-app@latest` with App Router, TypeScript, Tailwind CSS, ESLint options
  - [ ] 2.2 Verify TypeScript strict mode is enabled in `tsconfig.json` (`"strict": true`)
  - [ ] 2.3 Ensure `apps/web/src/app/` directory structure follows App Router conventions
  - [ ] 2.4 Create route group stubs: `(auth)/` and `(dashboard)/` under `app/`
- [ ] Task 3: Configure Tailwind CSS with design system tokens (AC: #2, #6)
  - [ ] 3.1 Extend `tailwind.config.ts` with custom colors:
    - `price-down`: `#22c55e` (green-500)
    - `price-up`: `#ef4444` (red-500)
    - `stable`: `#9ca3af` (gray-400)
    - `anomaly`: `#f59e0b` (amber-500)
    - `user-price`: `#2563eb` (blue-600)
  - [ ] 3.2 Configure base spacing unit of 4px in theme
  - [ ] 3.3 Set content max-width to 1440px as a theme value
  - [ ] 3.4 Configure sidebar widths: 240px (expanded) and 64px (collapsed) as theme values
- [ ] Task 4: Install and configure shadcn/ui (AC: #3)
  - [ ] 4.1 Run `npx shadcn@latest init` with New York style, slate base color, CSS variables
  - [ ] 4.2 Install required components: `npx shadcn@latest add button input dialog toast table`
  - [ ] 4.3 Verify all five components render correctly in a smoke test page
- [ ] Task 5: Load Inter font with tabular numerals (AC: #4)
  - [ ] 5.1 Configure Inter via `next/font/google` in root layout
  - [ ] 5.2 Add CSS class `font-tabular` with `font-variant-numeric: tabular-nums` for price displays
  - [ ] 5.3 Set Inter as the default font family in Tailwind config
- [ ] Task 6: Configure ESLint and Prettier (AC: #5)
  - [ ] 6.1 Install Prettier and `eslint-config-prettier`
  - [ ] 6.2 Create `.prettierrc` at root with consistent settings (semi, singleQuote, trailingComma, printWidth: 100)
  - [ ] 6.3 Extend ESLint config with Next.js recommended rules + Prettier
  - [ ] 6.4 Add `lint` and `format` scripts to root package.json
  - [ ] 6.5 Verify `npm run lint` and `npm run format` pass cleanly
- [ ] Task 7: Verify build and accessibility (AC: #7, #8)
  - [ ] 7.1 Run `npm run build` from root — must complete without errors
  - [ ] 7.2 Create a minimal `app/page.tsx` with semantic HTML and skip-to-content link
  - [ ] 7.3 Add `lang="en"` to the `<html>` element in root layout
  - [ ] 7.4 Ensure proper `<meta>` viewport tag is present

## Dev Notes

### Architecture Compliance

This story sets up the **Turborepo monorepo** structure that all subsequent stories depend on. The architecture mandates:

- **Monorepo structure**: `apps/web/` (Next.js frontend), `apps/api/` (Fastify backend — created in a later story), `packages/shared/` (shared Zod schemas and types), `packages/scraper/` (scraping engine — later story)
- **Only `apps/web/` and `packages/shared/` stubs are in scope** for this story. Do NOT create `apps/api/` or `packages/scraper/` — those come in later epics.
- **Turborepo** coordinates builds across packages with caching and parallelism

### Technical Stack (Exact Versions)

| Package | Version Constraint | Notes |
|---------|-------------------|-------|
| Next.js | 14+ (latest stable) | Use App Router, NOT Pages Router |
| React | 18+ (as bundled with Next.js) | |
| TypeScript | 5+ (strict mode) | `"strict": true` in tsconfig |
| Tailwind CSS | 3.4+ | Use `tailwind.config.ts` (TypeScript config) |
| shadcn/ui | Latest (uses @radix-ui primitives) | Initialize with `npx shadcn@latest init` |
| Turborepo | Latest stable | `turbo.json` at root |

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

### Debug Log References

### Completion Notes List

### Change Log
- 2026-03-31: Story created by SM agent — comprehensive developer guide with architecture compliance guardrails

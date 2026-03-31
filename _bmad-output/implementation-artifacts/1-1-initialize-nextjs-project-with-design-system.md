# Story 1.1: Initialize Next.js Project with Design System

Status: ready-for-dev

## Story

As a developer,
I want to bootstrap the Next.js application with the design system, linting, and TypeScript configuration,
so that all subsequent features have a consistent, accessible, and type-safe foundation to build upon.

## Acceptance Criteria

1. Next.js 14+ app created with App Router and TypeScript strict mode enabled
2. Tailwind CSS configured with custom color tokens: `price-down` (green-500 #22c55e), `price-up` (red-500 #ef4444), `stable` (gray-400 #9ca3af), `anomaly` (amber-500 #f59e0b), `user-price` (blue-600 #2563eb)
3. shadcn/ui installed with at least Button, Input, Dialog, Toast, and Table components available
4. Inter font loaded with `font-feature-settings: "tnum"` (tabular numerals) variant available for price displays
5. ESLint and Prettier configured with consistent rules
6. Base unit spacing (4px) configured in Tailwind theme
7. `npm run build` completes without errors
8. Lighthouse accessibility score >= 90 on empty shell

## Tasks / Subtasks

- [ ] Task 1: Initialize Turborepo monorepo structure (AC: #1, #5, #7)
  - [ ] Create root `package.json` with workspaces: `apps/*`, `packages/*`
  - [ ] Create `turbo.json` with build/lint/dev pipeline definitions
  - [ ] Create `tsconfig.base.json` with strict mode, path aliases, and shared compiler options
  - [ ] Create placeholder workspace packages: `apps/web`, `apps/api`, `packages/shared`, `packages/scraper`
  - [ ] Install Turborepo as a dev dependency at root

- [ ] Task 2: Bootstrap Next.js app in `apps/web` (AC: #1, #7)
  - [ ] Initialize Next.js 14+ with App Router (`app/` directory)
  - [ ] Configure `next.config.ts` (enable strict mode, configure transpilePackages for monorepo)
  - [ ] Set up `tsconfig.json` extending `tsconfig.base.json` with Next.js-specific settings
  - [ ] Create minimal `app/layout.tsx` root layout and `app/page.tsx` placeholder
  - [ ] Verify `npm run build` passes with zero errors

- [ ] Task 3: Configure Tailwind CSS with design tokens (AC: #2, #6)
  - [ ] Install and initialize Tailwind CSS v3+ with PostCSS
  - [ ] Configure `tailwind.config.ts` with custom theme extensions:
    - Colors: `price-down`, `price-up`, `stable`, `anomaly`, `user-price`
    - Spacing base unit: 4px (Tailwind default — confirm `spacing` scale is standard)
  - [ ] Set content paths to include `apps/web/src/**/*.{ts,tsx}`
  - [ ] Create `globals.css` with Tailwind directives and any CSS custom properties

- [ ] Task 4: Install and configure shadcn/ui (AC: #3)
  - [ ] Run `npx shadcn@latest init` with New York style, zinc base color
  - [ ] Configure `components.json` with correct aliases and Tailwind config path
  - [ ] Install required components: `npx shadcn@latest add button input dialog toast table`
  - [ ] Verify components import correctly in a test page

- [ ] Task 5: Configure Inter font with tabular numerals (AC: #4)
  - [ ] Use `next/font/google` to load Inter with all needed weights (400, 500, 600, 700)
  - [ ] Apply Inter as the default font in root layout via CSS variable
  - [ ] Create a `.font-tabular` utility class: `font-feature-settings: "tnum"` for price displays
  - [ ] Add the tabular class to Tailwind config as a custom utility or in globals.css

- [ ] Task 6: Configure ESLint and Prettier (AC: #5)
  - [ ] Install ESLint with `eslint-config-next`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`
  - [ ] Install Prettier with `prettier-plugin-tailwindcss` for class sorting
  - [ ] Create `.eslintrc.json` at root extending Next.js and TypeScript recommended rules
  - [ ] Create `.prettierrc` with consistent settings (singleQuote, semi, trailingComma, printWidth: 100)
  - [ ] Add `lint` and `format` scripts to root and app-level `package.json`
  - [ ] Verify `npm run lint` passes with zero warnings/errors

- [ ] Task 7: Verify build and accessibility (AC: #7, #8)
  - [ ] Run `npm run build` — must complete without errors
  - [ ] Serve the built app and run Lighthouse audit
  - [ ] Ensure accessibility score >= 90 (empty shell should score high with proper HTML lang, meta, font loading)
  - [ ] Fix any build warnings or accessibility issues found

## Dev Notes

### Technical Stack & Versions

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14+ (App Router) | Frontend framework with SSR |
| TypeScript | 5.x (strict mode) | Type safety |
| Tailwind CSS | 3.x | Utility-first styling |
| shadcn/ui | latest | Accessible component library (New York style) |
| Turborepo | latest | Monorepo build orchestration |
| React | 18.x | UI library (comes with Next.js) |
| Node.js | 20 LTS | Runtime |

### Monorepo Structure (Architecture Section 5)

```
ai-competitor-price-tracker/
├── apps/
│   ├── web/                    # Next.js frontend (THIS STORY)
│   │   ├── src/
│   │   │   ├── app/            # App Router pages
│   │   │   ├── components/
│   │   │   │   ├── ui/         # shadcn/ui components
│   │   │   │   ├── charts/     # Recharts wrappers (future)
│   │   │   │   ├── forms/      # Form components (future)
│   │   │   │   ├── tables/     # Data table components (future)
│   │   │   │   └── layout/     # Shell, sidebar, breadcrumbs (Story 1.2)
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── lib/            # Utilities, API client
│   │   │   └── stores/         # Zustand stores
│   │   ├── public/
│   │   ├── tailwind.config.ts
│   │   ├── next.config.ts
│   │   └── package.json
│   │
│   └── api/                    # Fastify backend (placeholder only)
│       └── package.json
│
├── packages/
│   ├── shared/                 # Shared Zod schemas and types (placeholder)
│   │   └── package.json
│   └── scraper/                # Scraping engine (placeholder)
│       └── package.json
│
├── turbo.json
├── package.json                # Root workspace
├── tsconfig.base.json
└── README.md
```

Placeholder packages (`apps/api`, `packages/shared`, `packages/scraper`) need only a minimal `package.json` with name and version so the monorepo resolves correctly. Do NOT implement their contents — those are future stories.

### Design Token Specification (UX Spec Section 5)

**Custom Color Tokens** — extend Tailwind theme `colors`:
```typescript
colors: {
  'price-down': '#22c55e',   // green-500 — favorable for user
  'price-up': '#ef4444',     // red-500 — competitor price increased
  'stable': '#9ca3af',       // gray-400
  'anomaly': '#f59e0b',      // amber-500 — attention needed
  'user-price': '#2563eb',   // blue-600 — user's price line on charts
}
```

**Typography**: Inter font, 14px base body, semibold headings, tabular numerals for price displays.

**Spacing**: Tailwind's default spacing scale already uses 4px base unit (1 = 4px), so no override is needed — just confirm it is not altered.

**Content Layout Constraints** (for future stories): max-width 1440px, centered, 24px page padding.

### Naming Conventions (Architecture Section 7.1)

| Context | Convention | Example |
|---------|-----------|---------|
| TypeScript files | kebab-case | `price-history-chart.tsx` |
| React components | PascalCase | `PriceHistoryChart` |
| TypeScript types | PascalCase | `Product`, `AlertRule` |
| CSS classes | Tailwind utility | `text-sm font-medium text-gray-900` |
| Environment vars | SCREAMING_SNAKE | `DATABASE_URL` |

### Critical Anti-Patterns to Avoid

- **Do NOT use Pages Router** — the project uses App Router exclusively
- **Do NOT install Express** — the backend uses Fastify (but backend is not this story)
- **Do NOT use CSS Modules or styled-components** — all styling is Tailwind utility classes
- **Do NOT use Redux or Context for state** — project uses TanStack Query (server) + Zustand (client), but those are not needed in this story
- **Do NOT install Recharts, TanStack Query, Zustand, React Hook Form, or TanStack Table yet** — they are needed for future stories, not the foundation
- **Do NOT create any routes or pages beyond the minimal root layout/page** — Story 1.2 handles the app shell layout
- **Do NOT set up the database, API, or any backend services** — those are separate stories

### shadcn/ui Configuration

Use the CLI to initialize: `npx shadcn@latest init`

Recommended config choices:
- Style: New York
- Base color: Zinc
- CSS variables: Yes
- Path aliases: `@/components`, `@/lib`, `@/hooks`
- Tailwind config path: `tailwind.config.ts`
- Components directory: `src/components/ui`

Then add the 5 required components:
```bash
npx shadcn@latest add button input dialog toast table
```

### ESLint/Prettier Configuration

Root `.eslintrc.json` should extend:
- `next/core-web-vitals`
- `plugin:@typescript-eslint/recommended`

Root `.prettierrc`:
```json
{
  "singleQuote": true,
  "semi": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### tsconfig.base.json

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "moduleResolution": "bundler",
    "module": "esnext",
    "target": "es2022",
    "lib": ["dom", "dom.iterable", "es2022"],
    "jsx": "preserve",
    "incremental": true
  },
  "exclude": ["node_modules"]
}
```

### Project Structure Notes

- This story creates the foundation the entire project builds upon — every file path and config decision propagates to all 30+ future stories
- The Turborepo monorepo structure MUST match architecture section 5 exactly: `apps/web`, `apps/api`, `packages/shared`, `packages/scraper`
- shadcn/ui components install into `apps/web/src/components/ui/` — future stories extend this directory
- The `apps/web/src/lib/` directory will later hold the API client, utilities — create it empty now
- The `apps/web/src/hooks/` and `apps/web/src/stores/` directories should be created empty for future stories

### References

- [Source: architecture.md#Section 2.1] — Frontend technology stack decisions
- [Source: architecture.md#Section 5] — Complete project structure
- [Source: architecture.md#Section 7.1] — Naming conventions
- [Source: epics-and-stories.md#Story 1.1] — Acceptance criteria
- [Source: ux-spec.md#Section 5] — Design system requirements (colors, typography, spacing)
- [Source: ux-spec.md#Section 7] — WCAG 2.1 AA accessibility requirements
- [Source: ux-spec.md#Section 8] — Performance UX targets
- [Source: brief.md#Section 6] — High-level technical architecture
- [Source: prd.md#Section 6] — Technology summary table

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

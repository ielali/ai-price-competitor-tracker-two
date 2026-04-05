# Story 1.3: Authentication and Session Management

Status: review

## Story

As a **user of the AI Competitor Price Tracker**,
I want to sign in with a secure session and access only authenticated areas of the app,
so that competitor and pricing data stays private to my workspace.

## Acceptance Criteria

1. Unauthenticated requests to app routes (except `/login` and static assets) redirect to `/login` with `callbackUrl` preserved.
2. `/login` renders an accessible email + password form using the existing design system (`Input`, `Button`).
3. Successful credentials issue a JWT session (Auth.js / NextAuth v5) with configurable demo user via `AUTH_DEMO_EMAIL` / `AUTH_DEMO_PASSWORD` (defaults documented in `.env.example`).
4. Production requires `AUTH_SECRET`; development falls back to an explicit insecure default only when `NODE_ENV !== "production"`.
5. Authenticated users can use all dashboard routes; session user id/email is available server-side via `auth()`.
6. Dashboard shell shows the signed-in email and a **Sign out** control that clears the session and returns to `/login`.
7. Automated tests cover credential validation and login form success/error paths.

## Dev Agent Record

### File List

- `apps/web/package.json` — `next-auth` dependency
- `apps/web/.env.example` — auth env template
- `apps/web/src/auth.ts` — Auth.js configuration
- `apps/web/src/middleware.ts` — route protection
- `apps/web/src/app/api/auth/[...nextauth]/route.ts`
- `apps/web/src/app/(auth)/layout.tsx`, `(auth)/login/page.tsx`
- `apps/web/src/components/providers/app-providers.tsx`
- `apps/web/src/components/auth/login-form.tsx`
- `apps/web/src/components/layout/user-menu.tsx`
- `apps/web/src/lib/demo-auth.ts`
- `apps/web/src/types/next-auth.d.ts`
- `apps/web/src/app/layout.tsx` — `SessionProvider` wrapper
- `apps/web/src/app/(dashboard)/layout.tsx` — user menu
- Removed duplicate `apps/web/src/app/page.tsx` (dashboard `(dashboard)/page.tsx` owns `/`)

### Completion Notes

- Demo credentials provider is intentional for local/dev; replace with OIDC or API-backed auth for production.

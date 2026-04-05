# Story 1.3: Authentication and Session Management

Status: review

## Story

As a **user of the AI Competitor Price Tracker**,
I want to sign in with a secure session and sign out when done,
so that dashboard routes are protected and my session is handled consistently until the Fastify auth API ships.

## Acceptance Criteria

1. Unauthenticated visitors to any app route (except `/login` and `/api/auth/*`) are redirected to `/login` with a safe relative `callbackUrl` when appropriate.
2. Login page at `/login` collects email and password and signs in via NextAuth credentials provider.
3. Valid sessions use JWT strategy with configurable `AUTH_SECRET`; demo credentials are driven by `DEMO_USER_EMAIL` and `DEMO_USER_PASSWORD`.
4. Authenticated users hitting `/login` are redirected to `/`.
5. Sign out is available from the sidebar and from Settings; it returns the user to `/login`.
6. Session user email is shown in the desktop sidebar (collapsed mode shows sign-out control with tooltip).
7. Duplicate root `app/page.tsx` removed; dashboard home remains at `/` under `(dashboard)`.

## Dev notes

- NextAuth v5 (`next-auth@beta`) with a credentials provider is a stand-in for architecture’s JWT + `/api/auth/login` Fastify routes.
- Replace env-based demo users with API calls when `apps/api` auth is implemented.

## Tasks / Subtasks

- [x] NextAuth configuration, route handler, middleware, and login UI
- [x] Sidebar + Settings sign out; session provider in root layout
- [x] Unit tests for credential validation helper and callback URL safety
- [x] `.env.example` for required variables

## Dev Agent Record

### Completion notes

- NextAuth v5 (`next-auth@beta`) with JWT sessions, credentials provider, and `authorized` callback for middleware redirects.
- `src/lib/validate-demo-credentials.ts` encapsulates demo user env checks; covered by Vitest.
- `src/lib/safe-relative-path.ts` prevents open redirects on `callbackUrl`; covered by Vitest.
- Login UI at `(auth)/login` with Suspense-wrapped form; safe relative `callbackUrl` handling.
- Removed duplicate `src/app/page.tsx`; `/` served by `(dashboard)/page.tsx`.
- Root layout wraps the app with client `SessionProvider`.
- Desktop sidebar: session email when expanded; sign-out with tooltip when collapsed.
- Settings page includes explicit sign-out control.

### File list

- `apps/web/src/auth.ts`
- `apps/web/src/app/api/auth/[...nextauth]/route.ts`
- `apps/web/middleware.ts`
- `apps/web/src/lib/validate-demo-credentials.ts`
- `apps/web/src/lib/safe-relative-path.ts`
- `apps/web/src/types/auth.d.ts`
- `apps/web/src/components/auth/session-provider.tsx`
- `apps/web/src/app/(auth)/login/page.tsx`
- `apps/web/src/app/(auth)/login/login-form.tsx`
- `apps/web/src/app/layout.tsx`
- `apps/web/src/components/layout/sidebar.tsx`
- `apps/web/src/app/(dashboard)/settings/page.tsx`
- `apps/web/.env.example`
- `apps/web/package.json`
- `apps/web/src/__tests__/validate-demo-credentials.test.ts`
- `apps/web/src/__tests__/safe-relative-path.test.ts`
- `apps/web/src/__tests__/login-form.test.tsx`
- `apps/web/src/__tests__/sidebar.test.tsx` (session mocks)
- `apps/web/src/__tests__/sidebar-session.test.tsx`
- `package-lock.json` (workspace install)

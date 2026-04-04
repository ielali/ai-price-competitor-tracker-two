# Story 1.3: Authentication and Session Management

Status: review

## Story

As a **user of the AI Competitor Price Tracker**,
I want to sign in with a secure session and sign out when done,
so that dashboard routes are protected and my session is handled consistently until the Fastify auth API ships.

## Acceptance Criteria

1. Unauthenticated visitors to any app route (except `/login`, `/register`, and `/api/auth/*`) are redirected to `/login` with a safe relative `callbackUrl` when appropriate.
2. Login page at `/login` collects email and password and signs in via `POST /api/auth/login` (credentials stand-in until Fastify auth API).
3. Valid sessions use signed JWT access and refresh tokens with configurable `AUTH_SECRET`; demo credentials are driven by `DEMO_USER_EMAIL` and `DEMO_USER_PASSWORD` (legacy `AUTH_DEMO_*` supported).
4. Authenticated users hitting `/login` or `/register` are redirected to `/`.
5. Sign out is available from the sidebar and from Settings; it returns the user to `/login`.
6. Session user email is shown in the desktop sidebar (collapsed mode shows sign-out control with tooltip).
7. Duplicate root `app/page.tsx` removed; dashboard home remains at `/` under `(dashboard)`.

## Dev notes

- Custom cookie-based JWT auth (jose + bcryptjs) replaces NextAuth in this worktree; swap `apps/web` routes for Fastify when `apps/api` auth is ready.
- Middleware refreshes short-lived access tokens using the HTTP-only refresh cookie when possible.
- `safeInternalPath` prevents open redirects on `callbackUrl`.

## Tasks / Subtasks

- [x] JWT login/register/refresh/logout API routes, middleware, login UI
- [x] Sidebar + Settings sign out; session read in dashboard layout
- [x] Unit tests for JWT helpers, validation, redirect, rate limit, user store, login form
- [x] `.env.example` for required variables

## Dev Agent Record

### Completion Notes List

- Access + refresh JWT cookies with `AUTH_SECRET`; demo user via env seed in `ensureDemoUserSeeded`.
- Middleware protects page routes; allows `/login`, `/register`, static assets, and all `/api/*` (only auth API implemented today).
- Login form uses safe `callbackUrl` for deep links after sign-in.
- Sidebar shows user email when expanded; `LogoutControl` with tooltip when collapsed.
- Root `app/page.tsx` removed so `/` is served from `(dashboard)/page.tsx`.

### File List

- `apps/web/src/middleware.ts`
- `apps/web/src/lib/auth/*`
- `apps/web/src/app/api/auth/login/route.ts`
- `apps/web/src/app/api/auth/logout/route.ts`
- `apps/web/src/app/api/auth/refresh/route.ts`
- `apps/web/src/app/api/auth/register/route.ts`
- `apps/web/src/app/(auth)/layout.tsx`
- `apps/web/src/app/(auth)/login/page.tsx`
- `apps/web/src/app/(auth)/login/login-form.tsx`
- `apps/web/src/app/(auth)/register/*`
- `apps/web/src/components/layout/logout-control.tsx`
- `apps/web/src/components/layout/sign-out-button.tsx`
- `apps/web/.env.example`
- `apps/web/src/__tests__/auth-*.test.ts`
- `apps/web/src/__tests__/user-store-demo.test.ts`
- `apps/web/src/__tests__/login-form.test.tsx`

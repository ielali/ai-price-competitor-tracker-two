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
- [x] Unit tests for credential validation helper
- [x] `.env.example` for required variables

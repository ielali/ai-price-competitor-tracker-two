# Story 1.3: Authentication & Session Management

Status: review

## Story

As a **user of the AI Competitor Price Tracker**,
I want to sign in and register with email and password, with sessions that survive refresh,
so that my dashboard and data stay private to authenticated users.

## Acceptance Criteria

1. Login page with email + password fields, validation, and error display
2. Register page with name, email, password, and confirm password
3. JWT access token + refresh token flow implemented
4. Protected routes redirect unauthenticated users to login
5. Session persists across browser refresh (token stored securely)
6. Logout clears session and redirects to login
7. API rate limiting enforced on auth endpoints
8. Form inputs have visible labels and `aria-describedby` error links (WCAG)

## Implementation summary

- **HTTP-only cookies** `pt_access` (15m) and `pt_refresh` (7d) store JWTs; middleware verifies access, rotates via refresh when expired, and redirects to `/login` when unauthenticated.
- **API routes** under `app/api/auth/`: `login`, `register`, `refresh`, `logout` with shared per-IP rate limits.
- **Auth UI** at `/login` and `/register` with accessible forms; **logout** in the sidebar and on Settings.
- **User store**: JSON file under `apps/web/.data/users.json` (dev / single-node; replace with a real database for production).

## File List (primary)

- `apps/web/src/middleware.ts`
- `apps/web/src/lib/auth/*`
- `apps/web/src/app/api/auth/login/route.ts`
- `apps/web/src/app/api/auth/register/route.ts`
- `apps/web/src/app/api/auth/refresh/route.ts`
- `apps/web/src/app/api/auth/logout/route.ts`
- `apps/web/src/app/(auth)/layout.tsx`
- `apps/web/src/app/(auth)/login/page.tsx`
- `apps/web/src/app/(auth)/register/page.tsx`
- `apps/web/src/components/auth/login-form.tsx`
- `apps/web/src/components/auth/register-form.tsx`
- `apps/web/src/components/auth/logout-button.tsx`
- `apps/web/src/__tests__/auth-*.test.ts`
- Removed duplicate `apps/web/src/app/page.tsx` in favor of `(dashboard)/page.tsx` for `/`.

## Configuration

- Set `AUTH_SECRET` to at least 32 characters in production (see `apps/web/.env.example`).

## Dev Agent Record

### Completion Notes

- JWT access/refresh with `jose`; passwords hashed with `bcryptjs`.
- Rate limiting: in-memory sliding counters per IP on auth routes.
- Open redirect on `from` query mitigated (relative paths only, no `//`).

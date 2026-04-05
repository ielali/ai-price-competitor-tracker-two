# Story 1.3: Authentication and Session Management

Status: review

## Story

As a **user of the AI Competitor Price Tracker**,
I want to sign in with a session-backed cookie and have dashboard routes protected,
so that only authenticated users can access application data and I can sign out when done.

## Acceptance Criteria

1. **Login surface** — `/login` presents email and password fields with client-side validation hints and accessible labels; form submits via a server action.
2. **Session persistence** — Successful login sets an HTTP-only, `SameSite=lax`, encrypted session cookie (`price_tracker_session`) with a configurable max age (14 days); session records `isLoggedIn` and optional `user.email`.
3. **Route protection** — Unauthenticated requests to any non-login route are redirected to `/login`; authenticated users hitting `/login` are redirected to `/`.
4. **Logout** — Users can end the session from Settings via a server action that clears the cookie and redirects to `/login`.
5. **Production configuration** — `SESSION_SECRET` (≥32 characters) is required in production runtime; `.env.example` documents the variable; development may use a documented fallback for local builds only.
6. **Validation** — Email format and minimum password length are validated server-side with clear error messages; demo auth accepts any credentials that pass validation (no external IdP in this story).
7. **Tests** — Automated tests cover login form rendering and validation helpers; `npm run lint` and `npm run build` succeed.

## Tasks / Subtasks

- [x] Add `iron-session` plus `SESSION_SECRET` handling in `src/lib/session.ts`
- [x] Implement `middleware.ts` for login redirect logic
- [x] Add `(auth)/login` page, layout, and `loginAction` / `logoutAction` server actions
- [x] Add `LoginForm` client component with `useFormState` / `useFormStatus`
- [x] Expose `validateLoginInput` and unit tests
- [x] Wire Settings page with signed-in email display and sign-out button
- [x] Remove redundant root `page.tsx` (dashboard home continues to serve `/` via `(dashboard)/page.tsx`)

## Dev Notes

- **Stack:** Next.js 14 App Router, iron-session, React 19 form hooks, shadcn/ui `Button` / `Input`.
- **Out of scope:** Real credential verification, OAuth, MFA, password reset, and backend user store (future stories / backend epic).
- **Security:** Demo authentication is intentionally credentials-agnostic after validation; replace with API-backed checks before production data access.

## Dev Agent Record

### Completion Notes

- Middleware matcher excludes static assets and Next internals.
- Cookie `secure` flag enabled when `NODE_ENV === 'production'`.

### File List

- `apps/web/src/middleware.ts`
- `apps/web/src/lib/session.ts`
- `apps/web/src/lib/auth-validation.ts`
- `apps/web/src/app/(auth)/layout.tsx`
- `apps/web/src/app/(auth)/login/page.tsx`
- `apps/web/src/app/(auth)/actions.ts`
- `apps/web/src/components/auth/login-form.tsx`
- `apps/web/src/app/(dashboard)/settings/page.tsx` (logout + session email display)
- `apps/web/.env.example`
- `apps/web/src/__tests__/auth-validation.test.ts`
- `apps/web/src/__tests__/login-form.test.tsx`

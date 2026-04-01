# Story 1.3: Authentication and Session Management

Status: ready-for-dev

## Story

As a **user of the AI Competitor Price Tracker**,
I want to securely log in and have my session persisted across browser refreshes,
so that I can access my private pricing data without re-authenticating on every visit.

## Acceptance Criteria

1. Login page at `/login` with email + password fields, validation, and inline error display
2. Register page at `/register` with name, email, password, and confirm password fields
3. JWT access token (15min TTL) + refresh token (7-day TTL) flow implemented
4. Protected routes redirect unauthenticated users to `/login` via Next.js middleware
5. Session persists across browser refresh (access token in memory, refresh token in HttpOnly cookie)
6. Logout clears session and redirects to `/login`
7. API rate limiting enforced on auth endpoints (10 req/min per IP)
8. All form inputs have visible labels and `aria-describedby` error links (WCAG 2.1 AA)

## Tasks / Subtasks

- [ ] Task 1: Create auth route group and page stubs (AC: #1, #2)
  - [ ] Create `apps/web/src/app/(auth)/` route group directory (`.gitkeep` exists from Story 1.2)
  - [ ] Create `apps/web/src/app/(auth)/layout.tsx` — centered card layout, no sidebar
  - [ ] Create `apps/web/src/app/(auth)/login/page.tsx` — Login page shell
  - [ ] Create `apps/web/src/app/(auth)/register/page.tsx` — Register page shell
  - [ ] Remove `apps/web/src/app/page.tsx` root redirect; root `/` should redirect to `/login` or `/` dashboard

- [ ] Task 2: Build auth forms with React Hook Form + Zod validation (AC: #1, #2, #8)
  - [ ] Install dependencies: `react-hook-form`, `zod`, `@hookform/resolvers` in `apps/web/`
  - [ ] Create Zod schemas in `apps/web/src/lib/auth-schemas.ts`:
    - `loginSchema`: `{ email: z.string().email(), password: z.string().min(8) }`
    - `registerSchema`: `{ name: z.string().min(2), email: z.string().email(), password: z.string().min(8), confirmPassword: z.string() }` with `.refine()` for password match
  - [ ] Build `<LoginForm />` component at `apps/web/src/components/auth/login-form.tsx`
    - Email input with `<label>` and `aria-describedby` error message id
    - Password input with show/hide toggle
    - Submit button with loading state
    - Error alert for server-side auth failures
  - [ ] Build `<RegisterForm />` component at `apps/web/src/components/auth/register-form.tsx`
    - Name, email, password, confirm password fields — all with labels and accessible error links
    - Password strength indicator (optional, nice to have)
  - [ ] Wire forms to placeholder submit handlers (API integration in Task 3)

- [ ] Task 3: Implement JWT auth API routes (AC: #3, #6, #7)
  - [ ] Create `apps/web/src/app/api/auth/login/route.ts` — POST handler
    - Accept `{ email, password }`, validate with Zod
    - Mock user lookup for initial implementation (no DB yet — use hardcoded test credentials)
    - Return `{ accessToken }` in response body; set `refreshToken` as HttpOnly cookie
    - Rate limit: reject with 429 after 10 requests/min per IP (use in-memory simple counter for now)
  - [ ] Create `apps/web/src/app/api/auth/register/route.ts` — POST handler
    - Accept `{ name, email, password }`, validate with Zod
    - Mock implementation (store in memory/return success)
    - Return 201 with new user object on success
  - [ ] Create `apps/web/src/app/api/auth/logout/route.ts` — POST handler
    - Clear the `refreshToken` HttpOnly cookie
    - Return 200
  - [ ] Create `apps/web/src/app/api/auth/refresh/route.ts` — POST handler
    - Read `refreshToken` cookie, validate, return new `accessToken`
    - Mock implementation (verify cookie exists and return new token)
  - [ ] Install `jose` for JWT signing/verification: `npm install jose` in `apps/web/`
  - [ ] Create `apps/web/src/lib/jwt.ts` with `signToken()` and `verifyToken()` helpers using `jose`

- [ ] Task 4: Create Zustand auth store (AC: #5, #6)
  - [ ] Create `apps/web/src/stores/auth-store.ts`
  - [ ] Store shape: `{ user: User | null; accessToken: string | null; setAuth: (user, token) => void; clearAuth: () => void }`
  - [ ] Access token stored in Zustand (in-memory only — NOT in localStorage for security)
  - [ ] `clearAuth()` calls the logout API route and resets state
  - [ ] Type `User` defined as `{ id: string; name: string; email: string }` in `apps/web/src/types/auth.ts`

- [ ] Task 5: Implement Next.js middleware for route protection (AC: #4)
  - [ ] Create `apps/web/src/middleware.ts` at the `apps/web/src/` level
  - [ ] Middleware checks for `refreshToken` HttpOnly cookie on all `/(dashboard)/*` routes
  - [ ] If cookie absent → redirect to `/login`
  - [ ] If cookie present → allow request to proceed (token refresh happens client-side)
  - [ ] Configure `matcher` to protect `/`, `/products`, `/competitors`, `/alerts`, `/reports`, `/settings` routes
  - [ ] Auth routes (`/login`, `/register`) redirect to `/` if already authenticated

- [ ] Task 6: Wire auth forms to API and test (AC: #3, #5, #6)
  - [ ] Connect `<LoginForm />` to `POST /api/auth/login` using `fetch`
  - [ ] On success: store `accessToken` in auth store, redirect to `/`
  - [ ] On failure: display inline error message
  - [ ] Connect `<RegisterForm />` to `POST /api/auth/register` using `fetch`
  - [ ] On success: auto-login or redirect to `/login`
  - [ ] Add logout button/action to sidebar (calls `clearAuth()`)
  - [ ] Implement token refresh on 401 responses using a simple `fetchWithAuth` wrapper in `apps/web/src/lib/api-client.ts`

- [ ] Task 7: Write unit tests (AC: all)
  - [ ] Test Zod schemas: valid inputs, invalid email, short password, password mismatch
  - [ ] Test JWT helpers: sign and verify round-trip
  - [ ] Test auth store: setAuth, clearAuth state transitions
  - [ ] Test middleware: unauthenticated redirect, authenticated pass-through
  - [ ] Test LoginForm render: labels present, error display, submit behavior
  - [ ] `npm run build` must succeed with zero errors
  - [ ] `npm run lint` must pass with zero warnings

## Dev Notes

### Technical Stack for This Story

| Technology | Usage | Notes |
|------------|-------|-------|
| Next.js App Router | Auth pages and API routes | `(auth)` route group; `middleware.ts` for protection |
| React Hook Form + Zod | Form validation | `@hookform/resolvers/zod` for integration |
| `jose` | JWT operations | Web-standard JWT library; works in Edge runtime |
| Zustand | Auth state | Access token in-memory; refresh token in HttpOnly cookie |
| shadcn/ui | Form components | Card, Input, Button, Alert, Label |

[Source: architecture.md#2.1, #2.2 — Frontend and backend tech stack]

### JWT Token Strategy

```
Access Token:  15-minute TTL, stored in Zustand (memory)
Refresh Token: 7-day TTL, stored in HttpOnly cookie (not readable by JS)
```

- **Why two tokens?** Access token is short-lived so compromise impact is minimal; refresh token is long-lived but only sent to `/api/auth/refresh` (HttpOnly prevents XSS access)
- **Middleware approach**: Check for refresh token cookie in Next.js middleware (can read cookies server-side); don't validate JWT in middleware to keep it fast — just check presence

[Source: architecture.md#2.2 — Auth: JWT (access + refresh tokens), 15min/7-day TTL]

### Architecture-Mandated File Locations

```
apps/web/src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx              # ← Centered auth card layout
│   │   ├── login/
│   │   │   └── page.tsx            # ← Login page
│   │   └── register/
│   │       └── page.tsx            # ← Register page
│   ├── api/
│   │   └── auth/
│   │       ├── login/route.ts      # ← POST /api/auth/login
│   │       ├── register/route.ts   # ← POST /api/auth/register
│   │       ├── logout/route.ts     # ← POST /api/auth/logout
│   │       └── refresh/route.ts    # ← POST /api/auth/refresh
│   └── (dashboard)/               # Existing from Story 1.2
├── components/
│   └── auth/
│       ├── login-form.tsx          # ← LoginForm component
│       └── register-form.tsx       # ← RegisterForm component
├── lib/
│   ├── auth-schemas.ts             # ← Zod validation schemas
│   ├── jwt.ts                      # ← JWT sign/verify helpers
│   └── api-client.ts               # ← fetchWithAuth wrapper
├── middleware.ts                   # ← Route protection middleware
├── stores/
│   └── auth-store.ts               # ← Zustand auth store
└── types/
    └── auth.ts                     # ← User type definition
```

[Source: architecture.md#5 — Project structure]

### Accessibility Requirements (WCAG 2.1 AA)

- Every form input must have an associated `<label>` (via `htmlFor` or wrapping)
- Error messages must be linked to inputs via `aria-describedby`
- Password show/hide toggle must have an accessible label (`aria-label="Show password"`)
- Focus order: Email → Password → Submit (Tab order follows visual order)
- Error messages must not rely on color alone (include icon or text prefix)
- Form submit with Enter key must work correctly
- Loading states must be communicated to screen readers (`aria-busy`, `aria-live`)

[Source: ux-spec.md#7 — WCAG 2.1 AA accessibility requirements]

### Security Notes

- **Never** store JWT access tokens in localStorage or sessionStorage (XSS vulnerability)
- Refresh tokens must be HttpOnly cookies with `SameSite=Strict` and `Secure` flags
- Rate limiting on auth endpoints prevents brute-force attacks
- Password hashing: bcrypt with cost factor 12 (for when real DB is added in later stories)
- OWASP Top 10 compliance is required
- CSRF protection: SameSite cookie + custom header check

[Source: architecture.md#2.2 — Security requirements; OWASP Top 10 compliance]

### Dependencies on Stories 1.1 and 1.2

- Turborepo monorepo with `apps/web/` containing Next.js App Router
- Tailwind CSS + shadcn/ui installed (Button, Input, Dialog, Toast, Label)
- Inter font and global CSS from Story 1.1
- `(auth)/.gitkeep` stub from Story 1.2 — remove and replace with actual auth layout
- Zustand installed (from Story 1.2 sidebar store) — no reinstall needed

### What This Story Does NOT Include

- Real database integration (no PostgreSQL yet — use mock/in-memory data)
- Real RBAC role assignment (scaffold the structure but don't implement role checks)
- OAuth/social login (not in scope for MVP)
- Email verification flow (post-MVP)
- Two-factor authentication (post-MVP)
- Actual bcrypt hashing (add when DB story lands; use mock comparison for now)

### Potential Pitfalls

1. **Edge runtime vs Node runtime**: `jose` works in Edge runtime; `bcrypt` does NOT (requires Node). Use `jose` for JWT in middleware and API routes for compatibility.
2. **Hydration with auth state**: Access token in Zustand (memory) will be lost on page refresh — this is intentional. The refresh token cookie triggers a silent token refresh via `useEffect` on app load.
3. **Middleware matcher**: Carefully configure `matcher` to exclude `/_next/*`, `/favicon.ico`, and static files. Otherwise middleware runs on every asset request.
4. **Cookie security flags**: In development, `Secure` flag may cause issues on `http://localhost`. Use `process.env.NODE_ENV === 'production'` to conditionally set it.
5. **Route group layout**: `(auth)/layout.tsx` overrides the root layout for auth pages — ensure it includes necessary providers but NOT the sidebar from `(dashboard)/layout.tsx`.

### References

- [Source: architecture.md#2.1] — Frontend tech stack (React Hook Form, Zod, Zustand)
- [Source: architecture.md#2.2] — Backend auth (JWT, bcrypt, refresh tokens)
- [Source: architecture.md#3.3] — Authentication flow and token strategy
- [Source: architecture.md#5] — Project structure
- [Source: ux-spec.md#7] — WCAG 2.1 AA accessibility requirements
- [Source: epics-and-stories.md#Epic1-Story1.3] — Story acceptance criteria
- [Source: prd.md#6] — Technical architecture summary

## Dev Agent Record

### Agent Model Used

_to be filled by dev agent_

### Debug Log References

### Completion Notes List

### File List

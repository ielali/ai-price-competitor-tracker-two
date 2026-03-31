# Story 1.3: Authentication & Session Management

Status: ready-for-dev

## Story

As an **E-Commerce Product Manager**,
I want to securely log into my account and manage my session,
so that my competitive pricing data is protected and I can access the platform reliably.

## Acceptance Criteria

1. Login page with email + password fields, validation, and error display
2. Register page with name, email, password, and confirm password
3. JWT access token + refresh token flow implemented
4. Protected routes redirect unauthenticated users to login
5. Session persists across browser refresh (token stored securely)
6. Logout clears session and redirects to login
7. API rate limiting enforced on auth endpoints
8. Form inputs have visible labels and `aria-describedby` error links (WCAG)

## Tasks / Subtasks

- [ ] Task 1: Backend — Auth database schema and service (AC: #3)
  - [ ] Create `users` table migration via Drizzle Kit with columns: id (UUID), tenant_id (UUID FK), email (unique), password_hash, name, role (default 'viewer'), created_at
  - [ ] Create `tenants` table migration: id (UUID), name, plan (default 'free'), settings (JSONB), created_at
  - [ ] Implement `auth.service.ts` with register, login, refreshToken, logout methods
  - [ ] Hash passwords with bcrypt (cost factor >= 12)
  - [ ] Generate JWT access token (15-min TTL) containing: userId, tenantId, role, email
  - [ ] Generate refresh token (7-day TTL) stored as httpOnly secure cookie
  - [ ] On register: create tenant + user in a transaction; assign 'admin' role to first user

- [ ] Task 2: Backend — Auth API routes (AC: #3, #7)
  - [ ] `POST /api/auth/register` — validate input (Zod), create tenant+user, return JWT pair
  - [ ] `POST /api/auth/login` — validate credentials, return JWT access token + set refresh cookie
  - [ ] `POST /api/auth/refresh` — read httpOnly refresh cookie, validate, issue new access token
  - [ ] `POST /api/auth/logout` — clear refresh cookie, invalidate refresh token
  - [ ] All auth routes use Zod schemas from `packages/shared/src/schemas/auth.ts`
  - [ ] Return consistent error format: `{ error: { code, message, details } }`

- [ ] Task 3: Backend — Auth middleware and rate limiting (AC: #4, #7)
  - [ ] Create Fastify auth plugin (`plugins/auth.ts`) that verifies JWT on every protected route
  - [ ] Extract tenantId and role from JWT; attach to request context
  - [ ] Create tenant isolation plugin (`plugins/tenant.ts`) that sets `app.current_tenant` on DB connection for RLS
  - [ ] Implement rate limiting on auth endpoints: 5 failed login attempts per 15 minutes per IP
  - [ ] Use Redis-based rate limiter (or `@fastify/rate-limit` plugin with Redis store)
  - [ ] Return 429 with `Retry-After` header when rate limit exceeded

- [ ] Task 4: Shared — Zod validation schemas (AC: #1, #2)
  - [ ] Create `packages/shared/src/schemas/auth.ts` with:
    - `registerSchema`: name (min 1), email (valid format), password (min 8, 1 uppercase, 1 number), confirmPassword (must match)
    - `loginSchema`: email (valid format), password (min 1)
    - `refreshSchema`: (no body — reads from cookie)
  - [ ] Export TypeScript types inferred from Zod schemas (RegisterInput, LoginInput, AuthResponse)

- [ ] Task 5: Frontend — Login page (AC: #1, #5, #8)
  - [ ] Create `apps/web/src/app/(auth)/login/page.tsx`
  - [ ] Form fields: email (type="email"), password (type="password")
  - [ ] Use React Hook Form + Zod resolver with shared `loginSchema`
  - [ ] Show inline validation errors with `aria-describedby` linking input to error message
  - [ ] Display server-side errors (invalid credentials, rate limited) in a toast or alert banner
  - [ ] On success: store access token in memory (Zustand store or React context), redirect to dashboard
  - [ ] "Don't have an account? Register" link to /register
  - [ ] "Forgot password?" link (placeholder — reset flow is out of scope for MVP)

- [ ] Task 6: Frontend — Register page (AC: #2, #8)
  - [ ] Create `apps/web/src/app/(auth)/register/page.tsx`
  - [ ] Form fields: name, email, password, confirm password
  - [ ] Use React Hook Form + Zod resolver with shared `registerSchema`
  - [ ] Real-time validation: password strength indicator (optional), confirm password match check
  - [ ] Show inline validation errors with `aria-describedby`
  - [ ] On success: auto-login (store tokens) and redirect to dashboard
  - [ ] "Already have an account? Login" link to /login

- [ ] Task 7: Frontend — Auth state management and protected routes (AC: #4, #5, #6)
  - [ ] Create auth store (Zustand) or context at `apps/web/src/stores/auth-store.ts`:
    - State: accessToken (in memory), user (id, name, email, role, tenantId), isAuthenticated
    - Actions: setAuth, clearAuth, refreshToken
  - [ ] Create `apps/web/src/lib/api-client.ts` — Axios or fetch wrapper that:
    - Attaches `Authorization: Bearer <token>` header to all API requests
    - Intercepts 401 responses → attempts token refresh → retries original request
    - On refresh failure → clear auth state → redirect to login
  - [ ] Create auth middleware component or Next.js middleware at `apps/web/src/middleware.ts`:
    - Check for valid session on protected routes (all routes under `(dashboard)`)
    - Redirect to `/login` if no valid session
    - Redirect to `/` (dashboard) if authenticated user visits `/login` or `/register`
  - [ ] Persist refresh token as httpOnly cookie (set by API); access token stays in memory only
  - [ ] On page load: call `/api/auth/refresh` to restore session from refresh cookie

- [ ] Task 8: Frontend — Logout flow (AC: #6)
  - [ ] Add logout action that:
    - Calls `POST /api/auth/logout` to invalidate server-side refresh token
    - Clears auth store (access token, user data)
    - Redirects to /login
  - [ ] Logout button placement: will be in sidebar (Story 1.2), but wire up the action now
  - [ ] Expose a `useAuth` hook from the auth store for components to access auth state and actions

- [ ] Task 9: Auth page styling and layout (AC: #1, #2, #8)
  - [ ] Create `apps/web/src/app/(auth)/layout.tsx` — centered card layout (no sidebar)
  - [ ] Auth pages use the design system: Inter font, shadcn/ui Input, Button, Card components
  - [ ] Responsive: full-width on mobile, max-width 400px card centered on desktop
  - [ ] All form inputs have visible `<label>` elements (not just placeholders)
  - [ ] Focus management: auto-focus first field on page load

## Dev Notes

### Technical Stack for This Story

| Technology | Version/Detail | Usage in This Story |
|------------|---------------|---------------------|
| Fastify | Latest | Auth API routes [Source: architecture.md#2.2] |
| Drizzle ORM | Latest | User/tenant schema and queries [Source: architecture.md#2.3] |
| Drizzle Kit | Latest | Database migrations [Source: architecture.md#2.3] |
| bcrypt | cost factor >= 12 | Password hashing [Source: architecture.md#2.2] |
| JWT (jsonwebtoken or jose) | - | Access + refresh token generation/verification [Source: architecture.md#3.3] |
| Zod | Latest | Input validation shared between frontend and backend [Source: architecture.md#2.2] |
| React Hook Form | Latest | Form handling on login/register pages [Source: architecture.md#2.1] |
| Zustand | Latest | Auth state management in frontend [Source: architecture.md#2.1] |
| @fastify/rate-limit | Latest | Auth endpoint rate limiting [Source: architecture.md#9.1] |
| @fastify/cookie | Latest | httpOnly refresh token cookie handling |
| shadcn/ui | Input, Button, Card, Toast | Auth page UI components [Source: architecture.md#2.1] |

### Architecture Compliance

**Authentication Flow** (from [Source: architecture.md#3.3]):
```
Client ──► Auth Service ──► PostgreSQL
  │  JWT Access Token (15min, in memory)
  │  + Refresh Token (7 day, httpOnly cookie)
  ▼
API Routes → Verify JWT → Extract tenant_id + role
             Role-based guards on each endpoint
```

**API Endpoints** (from [Source: architecture.md#6.1]):
```
POST   /api/auth/register          # Create account + tenant
POST   /api/auth/login             # Login → JWT + refresh cookie
POST   /api/auth/refresh           # Refresh access token via cookie
POST   /api/auth/logout            # Invalidate refresh token
```

**API Response Format** (from [Source: architecture.md#6.2]):
```typescript
// Success
{ data: { user: {...}, accessToken: "..." } }

// Error
{ error: { code: "VALIDATION_ERROR", message: "...", details: {...} } }
```

**Error Handling Pattern** (from [Source: architecture.md#7.2]):
```typescript
class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) { super(message); }
}
```

Use `AppError` for all auth errors:
- `VALIDATION_ERROR` (400) — invalid input
- `INVALID_CREDENTIALS` (401) — wrong email/password
- `TOKEN_EXPIRED` (401) — access token expired
- `RATE_LIMITED` (429) — too many failed attempts
- `EMAIL_TAKEN` (409) — duplicate email on register

**Database Schema** (from [Source: architecture.md#4.1]):
```sql
tenants (
  id UUID PK DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  plan VARCHAR(50) DEFAULT 'free',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
)

users (
  id UUID PK DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Row-Level Security** (from [Source: architecture.md#4.3]):
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_users ON users
  USING (tenant_id = current_setting('app.current_tenant')::UUID);
```

### Multi-Tenancy Requirements

This story establishes the multi-tenancy foundation that ALL subsequent stories depend on:

- Every API request must have `tenant_id` extracted from JWT and injected into DB context
- The `plugins/tenant.ts` Fastify plugin sets `app.current_tenant` PostgreSQL variable per request
- Drizzle ORM queries MUST include `tenant_id` in WHERE clauses (belt-and-suspenders with RLS)
- Registration creates BOTH a tenant AND a user in a single transaction
- The first user of a new tenant gets the 'admin' role automatically

### Security Requirements

From [Source: architecture.md#9.1, prd.md#5.2]:

- **Password**: bcrypt hash with cost factor >= 12
- **Password Policy**: min 8 chars, at least 1 uppercase letter, at least 1 number
- **Access Token**: JWT, 15-minute TTL, stored in JavaScript memory only (NOT localStorage)
- **Refresh Token**: 7-day TTL, httpOnly + Secure + SameSite=Strict cookie
- **Rate Limiting**: 5 failed login attempts per 15 minutes per IP
- **CORS**: Whitelist frontend origin only
- **Input Validation**: Zod schemas on all endpoints; reject unexpected fields
- **No Stack Traces**: Production error responses never expose internal details

### Frontend Route Structure

From [Source: architecture.md#5]:
```
apps/web/src/app/
├── (auth)/                    # Auth route group (no sidebar layout)
│   ├── layout.tsx             # Centered card layout
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
├── (dashboard)/               # Protected route group (sidebar layout, Story 1.2)
│   ├── layout.tsx             # App shell (created in Story 1.2, protected by auth)
│   └── page.tsx               # Dashboard home
└── layout.tsx                 # Root layout (font, global styles from Story 1.1)
```

Auth pages use the `(auth)` route group which has NO sidebar. Protected pages under `(dashboard)` route group will have the sidebar (Story 1.2).

### Backend Project Structure

From [Source: architecture.md#5]:
```
apps/api/src/
├── server.ts                  # Fastify app setup
├── routes/
│   └── auth.ts                # Login, register, refresh, logout
├── plugins/
│   ├── auth.ts                # JWT verification plugin
│   ├── tenant.ts              # Tenant isolation middleware
│   └── rate-limit.ts          # API rate limiting
├── services/
│   └── auth.service.ts        # Auth business logic
├── db/
│   ├── schema.ts              # Drizzle schema (tenants, users tables)
│   ├── migrations/            # Drizzle Kit migrations
│   ├── client.ts              # DB connection pool
│   └── seed.ts                # Demo/test data
└── utils/
    ├── errors.ts              # AppError class
    └── logger.ts              # Structured logging
```

**IMPORTANT**: This story creates the `apps/api/` directory for the first time. It must:
- Initialize a new `package.json` with Fastify + TypeScript dependencies
- Set up `tsconfig.json` extending from root `tsconfig.base.json`
- Create the Fastify server entry point (`server.ts`) with plugin registration
- Set up Drizzle ORM connection and schema

### Naming Conventions (from [Source: architecture.md#7.1])

| Context | Convention | Example |
|---------|-----------|---------|
| TypeScript files | kebab-case | `auth.service.ts`, `rate-limit.ts` |
| Database tables | snake_case, plural | `users`, `tenants` |
| Database columns | snake_case | `tenant_id`, `password_hash` |
| API endpoints | kebab-case, RESTful | `/api/auth/register` |
| React components | PascalCase | `LoginPage`, `RegisterForm` |
| TypeScript types | PascalCase | `User`, `Tenant`, `AuthResponse` |
| Environment vars | SCREAMING_SNAKE | `DATABASE_URL`, `JWT_SECRET` |

### Environment Variables Needed

```
DATABASE_URL=postgresql://user:pass@localhost:5432/pricetracker
JWT_SECRET=<random-256-bit-secret>
JWT_REFRESH_SECRET=<different-random-256-bit-secret>
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=http://localhost:3000
```

**CRITICAL**: Never commit secrets. Use `.env.example` with placeholder values only.

### Cross-Story Dependencies

- **Depends on Story 1.1**: Next.js project, Tailwind CSS, shadcn/ui, design system tokens must exist
- **Story 1.2 depends on this**: Sidebar layout needs auth state for logout button and user display
- **Story 1.4 depends on this**: Command palette needs authenticated context
- **All Epic 2+ stories depend on this**: Every API endpoint requires auth middleware and tenant isolation

### Frontend Data Fetching Pattern (from [Source: architecture.md#7.3])

```typescript
// Auth-related API calls should use plain fetch/axios (not TanStack Query)
// because auth is a side-effect, not cached server state
const login = async (email: string, password: string) => {
  const res = await apiClient.post('/api/auth/login', { email, password });
  authStore.setAuth(res.data.data);
};
```

For all subsequent authenticated API calls, the api-client wrapper adds the Authorization header automatically.

### What NOT to Do in This Story

- Do NOT implement password reset flow (out of scope for MVP per acceptance criteria)
- Do NOT implement OAuth/social login
- Do NOT implement email verification
- Do NOT implement team invitation (that's Story 7.2: RBAC)
- Do NOT create the sidebar or navigation (that's Story 1.2)
- Do NOT set up Docker/database containers (that's Story 10.1) — use local PostgreSQL and Redis or document that Docker Compose is needed
- Do NOT implement WebSocket authentication (that's a later concern)
- Do NOT add user profile editing
- Do NOT implement the `packages/shared` package fully — only create the auth schemas needed for this story

### Testing Guidance

- Unit test `auth.service.ts`: register (creates tenant+user), login (valid/invalid), token refresh, password hashing
- Integration test auth routes: 201 on register, 200 on login, 401 on bad credentials, 429 on rate limit
- Frontend: test that protected routes redirect to login, login form validates, successful login stores token
- Verify tenant isolation: register two users, confirm each only sees their own data
- Test refresh flow: access token expires → refresh request → new access token issued → original request retries

### Project Structure Notes

- This story creates `apps/api/` for the first time alongside modifications to `apps/web/`
- It also creates the first file in `packages/shared/src/schemas/`
- Alignment with monorepo structure: `turbo.json` should include `apps/api` in its workspace config
- If Story 1.1 did not fully set up Turborepo, this story should ensure the monorepo workspace structure works for both `apps/web` and `apps/api`

### References

- [Source: architecture.md#2.2] — Backend API technology stack (Fastify, TypeScript, JWT, bcrypt)
- [Source: architecture.md#2.3] — Database technology (PostgreSQL, Drizzle ORM)
- [Source: architecture.md#3.2] — Multi-tenancy pattern (shared-schema, RLS, tenant_id)
- [Source: architecture.md#3.3] — Authentication flow (JWT + refresh token)
- [Source: architecture.md#4.1] — Database schema (tenants, users tables)
- [Source: architecture.md#4.3] — Row-Level Security policies
- [Source: architecture.md#5] — Project structure (apps/api, apps/web, packages/shared)
- [Source: architecture.md#6.1] — REST API endpoints (auth routes)
- [Source: architecture.md#6.2] — API response format
- [Source: architecture.md#7.1] — Naming conventions
- [Source: architecture.md#7.2] — Error handling pattern (AppError class)
- [Source: architecture.md#9.1] — Security defense layers
- [Source: architecture.md#9.2] — OWASP Top 10 mitigations
- [Source: prd.md#5.2] — Security requirements (JWT, RBAC, encryption, rate limiting)
- [Source: prd.md#7.1] — User authentication story (acceptance criteria)
- [Source: ux-spec.md#7] — Accessibility requirements (WCAG 2.1 AA, form labels, aria-describedby)
- [Source: epics-and-stories.md#Story1.3] — Story acceptance criteria and description

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

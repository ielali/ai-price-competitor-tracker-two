# Story 1.3: Authentication & Session Management

Status: ready-for-dev

## Story

As a **user of the AI Competitor Price Tracker**,
I want to securely log in and register for an account with JWT-based authentication,
so that my competitive pricing data is protected and my session persists across browser refreshes.

## Acceptance Criteria

1. Login page with email + password fields, validation, and error display
2. Register page with name, email, password, and confirm password
3. JWT access token + refresh token flow implemented (15 min access TTL, 7-day refresh TTL)
4. Protected routes redirect unauthenticated users to login
5. Session persists across browser refresh (refresh token stored as httpOnly secure cookie)
6. Logout clears session and redirects to login
7. API rate limiting enforced on auth endpoints (5 attempts per 15 min per IP)
8. Form inputs have visible labels and `aria-describedby` error links (WCAG 2.1 AA)
9. Password hashed with bcrypt (cost factor >= 12)
10. Password requirements: minimum 8 characters, at least 1 uppercase letter, 1 number

## Tasks / Subtasks

- [ ] Task 1: Set up Fastify API server with auth infrastructure (AC: #3, #7, #9)
  - [ ] Create `apps/api/` directory with Fastify server setup in `src/server.ts`
  - [ ] Install dependencies: `fastify`, `@fastify/jwt`, `@fastify/cookie`, `@fastify/cors`, `@fastify/rate-limit`, `bcrypt`, `zod`, `fastify-type-provider-zod`
  - [ ] Configure Fastify with Zod type provider for schema validation
  - [ ] Set up structured JSON logging via Fastify's built-in pino logger
  - [ ] Create `src/utils/errors.ts` with `AppError` class (code, message, statusCode, details)
  - [ ] Configure global error handler that maps AppError to consistent API response format
  - [ ] Set up CORS plugin allowing the Next.js frontend origin

- [ ] Task 2: Database schema and connection for auth (AC: #3, #9)
  - [ ] Install Drizzle ORM: `drizzle-orm`, `drizzle-kit`, `pg`
  - [ ] Create `src/db/client.ts` with PostgreSQL connection pool using `DATABASE_URL` env var
  - [ ] Create `src/db/schema.ts` with `tenants` and `users` tables per architecture spec:
    - `tenants`: id (UUID PK), name, plan, settings (JSONB), created_at
    - `users`: id (UUID PK), tenant_id (FK), email (UNIQUE), password_hash, name, role (default 'viewer'), created_at
  - [ ] Generate initial migration with `drizzle-kit generate`
  - [ ] Create `src/db/migrate.ts` script to run migrations programmatically

- [ ] Task 3: Auth service with JWT token management (AC: #3, #5, #9, #10)
  - [ ] Create `src/services/auth.service.ts` with:
    - `register(name, email, password)`: validate password rules, hash with bcrypt (cost 12), create tenant + user, return tokens
    - `login(email, password)`: verify credentials, return access + refresh tokens
    - `refreshToken(refreshToken)`: verify refresh token, issue new access token
    - `logout()`: clear refresh token cookie
  - [ ] Access token: JWT signed with secret, 15-minute TTL, payload: `{ userId, tenantId, role }`
  - [ ] Refresh token: JWT signed with separate secret, 7-day TTL, stored as httpOnly secure cookie
  - [ ] Password validation: min 8 chars, at least 1 uppercase, at least 1 number

- [ ] Task 4: Auth routes (AC: #1, #2, #3, #6, #7)
  - [ ] Create `src/routes/auth.ts` with Fastify route handlers:
    - `POST /api/auth/register` — body: { name, email, password, confirmPassword }; returns 201 with access token
    - `POST /api/auth/login` — body: { email, password }; returns 200 with access token, sets refresh cookie
    - `POST /api/auth/refresh` — reads refresh token from cookie; returns new access token
    - `POST /api/auth/logout` — clears refresh cookie; returns 200
  - [ ] All request bodies validated with Zod schemas (shared in `packages/shared/` if monorepo exists, otherwise `src/schemas/`)
  - [ ] Configure `@fastify/rate-limit` on auth routes: max 5 requests per 15 min per IP

- [ ] Task 5: Auth middleware plugin (AC: #4)
  - [ ] Create `src/plugins/auth.ts` — Fastify plugin that:
    - Decodes and verifies JWT access token from `Authorization: Bearer <token>` header
    - Attaches `{ userId, tenantId, role }` to Fastify request decorator
    - Returns 401 for missing/invalid/expired tokens
  - [ ] Create `src/plugins/tenant.ts` — sets `app.current_tenant` PostgreSQL session variable for RLS
  - [ ] Create route guard decorator for protected routes

- [ ] Task 6: Frontend auth pages — Login (AC: #1, #8)
  - [ ] Create `apps/web/src/app/(auth)/login/page.tsx`
  - [ ] Form fields: email (required, email format), password (required)
  - [ ] Use React Hook Form + Zod for client-side validation
  - [ ] Visible labels on all fields; error messages linked via `aria-describedby`
  - [ ] Display server-side errors (invalid credentials, rate limited) in an alert banner
  - [ ] "Don't have an account? Register" link to register page
  - [ ] On success: store access token in memory, redirect to dashboard

- [ ] Task 7: Frontend auth pages — Register (AC: #2, #8, #10)
  - [ ] Create `apps/web/src/app/(auth)/register/page.tsx`
  - [ ] Form fields: name (required), email (required, email format), password (required), confirm password (required, must match)
  - [ ] Client-side password validation: min 8 chars, 1 uppercase, 1 number — show requirements checklist
  - [ ] Visible labels; error messages linked via `aria-describedby`
  - [ ] "Already have an account? Log in" link to login page
  - [ ] On success: auto-login and redirect to dashboard

- [ ] Task 8: Frontend session management (AC: #4, #5, #6)
  - [ ] Create `src/lib/auth.ts` — auth utility module:
    - `getAccessToken()`: returns in-memory access token
    - `setAccessToken(token)`: stores token in memory (NOT localStorage)
    - `clearAuth()`: clears token and redirects to login
    - `refreshAccessToken()`: calls `/api/auth/refresh`, updates in-memory token
  - [ ] Create `src/lib/api-client.ts` — Axios/fetch wrapper that:
    - Attaches `Authorization: Bearer <token>` header to all requests
    - On 401 response: attempts token refresh, retries original request once
    - On refresh failure: clears session, redirects to login
  - [ ] Create auth middleware in `src/middleware.ts` (Next.js middleware):
    - Check for valid session; redirect unauthenticated users to `/login`
    - Allow `/login` and `/register` routes without auth
  - [ ] Implement logout: clear in-memory token, call `/api/auth/logout` to clear cookie, redirect to `/login`

- [ ] Task 9: Health check endpoint (AC: foundational)
  - [ ] Create `src/routes/health.ts` with `GET /health` returning service status, DB connectivity, version

## Dev Notes

### Technical Stack Required for This Story

| Technology | Version/Detail | Purpose |
|------------|---------------|---------|
| Fastify | Latest stable | API framework — chosen for 2-3x speed over Express |
| @fastify/jwt | Latest | JWT signing and verification |
| @fastify/cookie | Latest | httpOnly cookie management for refresh tokens |
| @fastify/rate-limit | Latest | Rate limiting on auth endpoints |
| @fastify/cors | Latest | CORS configuration for frontend access |
| bcrypt | Latest | Password hashing with configurable cost factor |
| Drizzle ORM + drizzle-kit | Latest | Type-safe PostgreSQL queries and migrations |
| pg | Latest | PostgreSQL client driver |
| Zod | Latest | Schema validation (shared between frontend and backend) |
| fastify-type-provider-zod | Latest | Fastify + Zod integration |
| React Hook Form | Latest | Form state management on frontend |
| next/headers | Built-in | Next.js middleware for route protection |

### Architecture Compliance

**Project Structure** (from [Source: architecture.md#5]):
```
ai-competitor-price-tracker/
├── apps/
│   ├── web/                          # Next.js frontend (Story 1.1)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (auth)/           # Auth routes <-- THIS STORY
│   │   │   │   │   ├── login/page.tsx
│   │   │   │   │   └── register/page.tsx
│   │   │   │   ├── (dashboard)/      # Protected routes
│   │   │   │   └── layout.tsx
│   │   │   ├── lib/
│   │   │   │   ├── auth.ts           # Auth utility <-- THIS STORY
│   │   │   │   └── api-client.ts     # API client <-- THIS STORY
│   │   │   └── middleware.ts          # Next.js route middleware <-- THIS STORY
│   │
│   └── api/                          # Fastify backend <-- THIS STORY
│       ├── src/
│       │   ├── server.ts             # Fastify app setup
│       │   ├── routes/
│       │   │   ├── auth.ts           # Login, register, refresh
│       │   │   └── health.ts         # Health checks
│       │   ├── plugins/
│       │   │   ├── auth.ts           # JWT verification plugin
│       │   │   ├── tenant.ts         # Tenant isolation middleware
│       │   │   └── rate-limit.ts     # API rate limiting
│       │   ├── services/
│       │   │   └── auth.service.ts   # Auth business logic
│       │   ├── db/
│       │   │   ├── schema.ts         # Drizzle schema (tenants, users)
│       │   │   ├── migrations/       # Drizzle Kit migrations
│       │   │   ├── seed.ts           # Demo/test data
│       │   │   └── client.ts         # DB connection pool
│       │   ├── schemas/              # Zod validation schemas
│       │   └── utils/
│       │       ├── errors.ts         # AppError class
│       │       └── logger.ts         # Structured logging
│       ├── package.json
│       └── tsconfig.json
```

**CRITICAL: This story sets up the entire `apps/api/` backend.** Stories 1.1 and 1.2 only created the frontend shell. This is the first story that touches the backend.

### Authentication Flow (from [Source: architecture.md#3.3])

```
Client → POST /api/auth/login → Auth Service → PostgreSQL (verify credentials)
  ← 200 { data: { accessToken } } + Set-Cookie: refreshToken (httpOnly, secure, 7d)

Client → GET /api/products (protected) → Auth Plugin (verify JWT) → Route Handler
  ← 200 { data: [...] }

Client → POST /api/auth/refresh (cookie auto-sent) → Auth Service → New access token
  ← 200 { data: { accessToken } }
```

- Access token: stored in memory (JavaScript variable), NOT localStorage — prevents XSS theft
- Refresh token: httpOnly secure cookie — prevents JavaScript access
- On page refresh: access token lost, client calls `/api/auth/refresh` to get new one

### API Response Format (from [Source: architecture.md#6.2])

```typescript
// Success
{ data: T | T[], meta?: { page, pageSize, total, totalPages } }

// Error
{ error: { code: string, message: string, details?: object } }
```

Error codes for auth:
- `VALIDATION_ERROR` (400) — invalid input
- `INVALID_CREDENTIALS` (401) — wrong email/password
- `TOKEN_EXPIRED` (401) — access token expired
- `RATE_LIMITED` (429) — too many failed attempts
- `INTERNAL_ERROR` (500) — unexpected server error

### Error Handling Pattern (from [Source: architecture.md#7.2])

```typescript
class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
  }
}
```

### Multi-Tenancy Pattern (from [Source: architecture.md#3.2])

- Every user belongs to a tenant. On register, create a new tenant AND user (user becomes admin of their tenant).
- JWT payload includes `tenantId` — all downstream queries filter by this.
- PostgreSQL Row-Level Security (RLS) enforces isolation at DB level.
- Tenant isolation middleware sets `app.current_tenant` session variable.

```typescript
const products = await db
  .select()
  .from(productsTable)
  .where(eq(productsTable.tenantId, ctx.tenantId));
```

### Password Validation Rules

```typescript
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least 1 number');
```

### Rate Limiting Configuration

```typescript
await app.register(rateLimit, {
  max: 5,
  timeWindow: '15 minutes',
  keyGenerator: (request) => request.ip,
  errorResponseBuilder: () => ({
    error: { code: 'RATE_LIMITED', message: 'Too many attempts. Try again later.' }
  })
});
```

### Naming Conventions (from [Source: architecture.md#7.1])

| Context | Convention | Example |
|---------|-----------|---------|
| TypeScript files | kebab-case | `auth.service.ts`, `api-client.ts` |
| React components | PascalCase | `LoginForm`, `RegisterPage` |
| Database tables | snake_case, plural | `users`, `tenants` |
| Database columns | snake_case | `tenant_id`, `password_hash` |
| API endpoints | kebab-case, RESTful | `/api/auth/login` |
| Environment vars | SCREAMING_SNAKE | `DATABASE_URL`, `JWT_SECRET` |

### Environment Variables Needed

```
DATABASE_URL=postgresql://user:pass@localhost:5432/pricetracker
JWT_ACCESS_SECRET=<random-secret-for-access-tokens>
JWT_REFRESH_SECRET=<random-secret-for-refresh-tokens>
CORS_ORIGIN=http://localhost:3000
API_PORT=4000
```

### Database Schema Details

```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  plan VARCHAR(50) DEFAULT 'free',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
```

### RBAC Roles (scaffold only — full implementation in Story 7.2)

| Role | Description | This Story |
|------|-------------|-----------|
| admin | Full access | Created on register (tenant owner) |
| manager | Read/write products and alerts | Scaffolded in schema |
| viewer | Read-only | Default role in schema |

This story only needs to include the `role` field in the JWT payload and database schema. Role-based route guards are implemented in Story 7.2.

### UX Requirements for Auth Pages

From [Source: ux-spec.md#7] — WCAG 2.1 AA:
- All form inputs have visible `<label>` elements (not just placeholder text)
- Error messages linked via `aria-describedby` to their input fields
- Minimum 4.5:1 contrast ratio for text
- Visible focus rings on all interactive elements
- Form submission via Enter key supported

From [Source: ux-spec.md#5] — Design System:
- Use shadcn/ui Button, Input, and Card components
- Tailwind CSS for styling, consistent with design tokens from Story 1.1
- Inter font for all text

### Security Considerations (from [Source: architecture.md#9])

- Access token stored in memory only (not localStorage, not sessionStorage)
- Refresh token in httpOnly + Secure + SameSite=Strict cookie
- bcrypt cost factor >= 12 for password hashing
- No password stored in plaintext anywhere
- Rate limiting on all auth endpoints
- CORS whitelist restricts API access to known frontend origin
- Zod validation on all API inputs prevents injection

### Cross-Story Dependencies

- **Depends on Story 1.1**: Next.js project with Tailwind CSS and shadcn/ui must exist
- **Depends on Story 1.2**: App shell layout exists (auth pages use a simpler layout without sidebar)
- **Required by Story 1.4**: Command palette needs authenticated context
- **Required by Story 2.1+**: All product/competitor features need authenticated API routes
- **Required by Story 7.2**: RBAC extends the auth scaffolding created here
- **Required by Story 7.3**: Multi-tenant isolation builds on tenant_id in JWT

### What NOT to Do in This Story

- Do NOT implement full RBAC route guards — just include role in JWT payload and DB schema
- Do NOT implement password reset via email — that's deferred (PRD Story 7.1 includes it but it's not in this epic's scope)
- Do NOT implement team member invitations — that's Story 7.2
- Do NOT create the scraper or analysis services — only auth-related API code
- Do NOT set up Docker/docker-compose — that's Epic 10 Story 10.1
- Do NOT implement WebSocket connections — that's a later concern
- Do NOT over-engineer token storage — in-memory for access token, httpOnly cookie for refresh

### Project Structure Notes

- This story creates the `apps/api/` directory from scratch — it's the backend foundation
- Auth pages use the `(auth)` route group in Next.js — these render WITHOUT the app shell sidebar
- The `(dashboard)` route group (created in Story 1.2) renders WITH the sidebar — auth middleware protects these routes
- Zod schemas should ideally live in `packages/shared/` for reuse between frontend and backend. If monorepo is not fully configured yet, place them in `apps/api/src/schemas/` and `apps/web/src/lib/schemas/` with a TODO to consolidate.

### References

- [Source: architecture.md#2.2] — Backend API technology stack (Fastify, TypeScript, Zod)
- [Source: architecture.md#3.2] — Multi-tenancy pattern (shared-schema with tenant_id + RLS)
- [Source: architecture.md#3.3] — Authentication flow (JWT access + refresh tokens)
- [Source: architecture.md#4.1] — Database schema (tenants, users tables)
- [Source: architecture.md#5] — Project structure (apps/api/ layout)
- [Source: architecture.md#6.1] — REST API endpoints for auth
- [Source: architecture.md#6.2] — API response format
- [Source: architecture.md#7.1] — Naming conventions
- [Source: architecture.md#7.2] — Error handling pattern (AppError)
- [Source: architecture.md#9] — Security architecture (OWASP, defense layers)
- [Source: ux-spec.md#7] — Accessibility requirements (WCAG 2.1 AA)
- [Source: ux-spec.md#5] — Design system component library
- [Source: epics-and-stories.md#Epic1-Story1.3] — Story acceptance criteria
- [Source: prd.md#5.2] — Security requirements
- [Source: prd.md#10-Story7.1] — User authentication requirements

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

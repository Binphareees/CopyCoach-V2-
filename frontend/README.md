# CopyCoach AI — Frontend

Production workflow app for copywriting critique, drills, and tiered subscription support. Next.js 16 (App Router, Turbopack), React 19, Supabase, Paystack.

## Stack

- **Framework**: Next.js 16.2.11 (App Router, Turbopack) with TypeScript (type-checked on `next build`; lint runs via ESLint flat config)
- **Auth**: Supabase Auth (email/password, PKCE). Sessions live in localStorage; API routes verify the `Authorization: Bearer <access_token>` with the service role each request. There is **no cookie/middleware auth** — the project deliberately trusts only verified JWTs server-side.
- **DB**: Supabase Postgres. Access via `@/lib/supabase-admin` (service role) server-side; `@/lib/supabase` (anon) client-side.
- **Payments**: Paystack (initialize / verify / webhook). Webhook is HMAC-SHA512 verified and fails closed if `PAYSTACK_SECRET_KEY` is missing.
- **Email**: Resend (preferred) with nodemailer/SMTP fallback via `@/lib/email`.
- **AI**: Gemini (preferred) with Groq and mock fallbacks for improve/support generation.
- **Analytics**: PostHog client + server (`@/lib/analytics`, `components/providers/AnalyticsProvider`).
- **Error tracking**: Sentry (server via `instrumentation.ts`, client via `components/providers/SentryErrorBoundary`).
- **Rate limiting**: Upstash Redis sliding window with in-memory fallback (`@/lib/rate-limit`, `@/lib/redis`).

## Env vars

Copy `frontend/.env.example` -> `frontend/.env.local`. Required for local dev:

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | server-only; never expose client-side |
| `GROQ_API_KEY` | ✅ | used when Gemini absent |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | ✅ | client checkout |
| `PAYSTACK_SECRET_KEY` | ✅ | webhook HMAC + verification |
| `NEXT_PUBLIC_APP_URL` | ⚠ | production URL (defaults to request origin) |
| `RESEND_API_KEY` | ⚠ | enables Resend; else SMTP fallback |
| `SMTP_USER` / `SMTP_PASS` / `SMTP_HOST` / `SMTP_PORT` | ⚠ | nodemailer fallback |
| `DEVELOPER_EMAIL` | ⚠ | support/feedback alerts destination |
| `ADMIN_EMAILS` | ⚠ | comma-separated admins for `/api/feedback` + admin dashboard |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | ⚠ | distributed rate limits; in-memory fallback otherwise |
| `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST` | ⚠ | analytics |
| `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` | ⚠ | error tracking |
| `GEMINI_API_KEY` | ⚠ | preferred AI provider |

Integrations degrade gracefully — the app runs without any of the ⚠ keys.

## Architecture

All authentication-sensitive logic lives server-side in API routes. The client never sends a user id; the server derives identity from the JWT:

```
client ── Authorization: Bearer <access_token> ──> route handler
                                                     ├─ getServerUser(token) → verified Supabase user
                                                     ├─ rate limit (user or IP)
                                                     └─ business logic
```

Key server libraries:

- `src/lib/auth-server.ts` — `getServerUser`, `isAdmin`, `getClientIdentifier` (JWT-derived)
- `src/lib/supabase-admin.ts` — service-role client (server only)
- `src/lib/redis.ts` — Upstash KV with in-memory fallback
- `src/lib/rate-limit.ts` — sliding-window rate limiter (Upstash or memory)
- `src/lib/subscription.ts` — idempotent Pro activation (10-min duplicate window)
- `src/lib/email.ts` — Resend/SMTP developer notifications
- `src/lib/analytics.ts` — PostHog server events

## Scripts

```bash
npm run dev          # Next.js dev server (Turbopack), http://localhost:3000
npm run build        # production build — runs ESLint + TypeScript, fails on errors
npm run lint         # eslint (flat config)
npx tsc --noEmit     # typecheck
```

## Security notes

- `/api/improve`, `/api/paystack/*`, `/api/auth/me`, `/api/auth/profile-sync` require a verified token (401 otherwise).
- `/api/feedback` GET/PATCH are admin-only (`ADMIN_EMAILS`); POST is open to logged-in users.
- The old `/api/auth/login` route (created users from client-provided email without proof) is removed.
- Paystack webhook verifies `x-paystack-signature` (HMAC-SHA512) and fails closed.
- Rate limits: improve 30/60s per user; support 12/60s per IP; feedback submit 10/60s per IP; signup 5/hour per IP.

## Deployment (Vercel)

1. Push to GitHub and import the repo in Vercel. Workspace root: `CopyCoach`; project root: `frontend` (Next.js is auto-detected from `frontend/`).
2. Set all env vars from the table (⚠ keys required in production: `NEXT_PUBLIC_APP_URL`, `RESEND_API_KEY`, `UPSTASH_REDIS_REST_URL/TOKEN`, PostHog, Sentry, `ADMIN_EMAILS`).
3. Build command: `npm run build` (workspace-aware). Output is regular (no `output: 'standalone'`).
4. Set the Paystack webhook URL to `https://<your-domain>/api/paystack/webhook`.

### DNS (via DNSHE)

Point the custom domain at Vercel's nameservers in the DNSHE panel:

| Type | Host | Value |
|---|---|---|
| A | `@` | `76.76.21.21` (Vercel) |
| AAAA | `@` | `::ffff:4c4c:1515` (Vercel) |
| CNAME | `www` | `cname.vercel-dns.com` |

Then add the domain in Vercel → your project → Settings → Domains and complete the SSL provisioning. `NEXT_PUBLIC_APP_URL` must be the final `https://<domain>` so Paystack callbacks round-trip correctly.

## Admin setup

Define `ADMIN_EMAILS` (comma-separated) in the environment. The admin dashboard lives at `/dashboard/admin/feedback`; non-admins are redirected away, and the API enforces the same check server-side.
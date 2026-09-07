# Project Context

## Project Overview

**CopyCoach AI** is an AI-powered copywriting coach and copy generation web application. It helps users improve their marketing copy by providing AI-driven analysis, scoring, and rewriting with coaching advice. The core loop is: user writes copy -> AI scores it (0-100) across multiple dimensions -> AI rewrites/improves it -> user learns from the critique.

The application targets beginner copywriters, freelancers, marketers, and anyone looking to improve their copywriting skills. It uses structured frameworks (AIDA, PAS, BAB/FAB) to teach copywriting principles through practice and feedback.

## Current Status

- **Authentication**: ✅ Complete
- **Landing Page**: ✅ Complete
- **AI Copy Generation & Scoring**: ✅ Complete
- **Dashboard (Core UX)**: ✅ Complete
- **Copy History & Projects**: ✅ Complete
- **Payment/Subscription (Paystack)**: ✅ Complete
- **Rate Limiting & Security Hardening**: ✅ Complete
- **Email Notifications**: ✅ Complete
- **Admin Feedback Dashboard**: ✅ Complete
- **AI Support Chat**: ✅ Complete
- **Mobile App Download (PWA)**: ✅ Complete (placeholder APK)
- **Analytics (PostHog)**: ✅ Complete
- **Error Tracking (Sentry)**: ✅ Complete
- **Profile & Settings**: ✅ Complete
- **PDF Export**: ✅ Complete
- **Drill Critique Feedback System**: ✅ Complete
- **Gamification (XP, levels, achievements)**: 🔴 Not Started (defined in docs, not implemented)
- **Community Features**: 🔴 Not Started (defined in roadmap)
- **Voice Coaching**: 🔴 Not Started (defined in roadmap)
- **Real Mobile Apps (iOS/Android)**: 🔴 Not Started (currently stub/PWA only)
- **Component Decomposition**: ⚠️ Needs Attention (dashboard page is 2074 lines)

## Technology Stack

| Layer | Technology | Details |
|-------|-----------|---------|
| **Framework** | Next.js 16.2.11 | App Router, Turbopack, TypeScript |
| **React** | React 19.2.4 | Latest React with server components support |
| **Styling** | Tailwind CSS v4 | `@tailwindcss/postcss`, custom design tokens in `globals.css` |
| **Database** | Supabase (Postgres) | Service role for server-side, anon key for client |
| **Auth** | Supabase Auth | Email/password + Google OAuth (PKCE flow) |
| **Payments** | Paystack | Initialize, verify, webhook (NGN 5,000/mo Pro plan) |
| **AI (Primary)** | Google Gemini | `gemini-3.6-flash` model via `@google/genai` SDK |
| **AI (Fallback)** | Groq | `groq/compound` model via `groq-sdk` |
| **Email** | Resend (primary) | With nodemailer/SMTP fallback |
| **Analytics** | PostHog | Client + server-side event tracking |
| **Error Tracking** | Sentry | Server-side via `instrumentation.ts`, client via ErrorBoundary |
| **Rate Limiting** | Upstash Redis | Sliding window with in-memory fallback |
| **PDF Generation** | jsPDF | Dynamic import for styled A4 PDF export |
| **Icons** | Lucide React | Extensive icon usage throughout UI |
| **Animations** | Framer Motion | Used in UI components |
| **Deployment** | Vercel | Project: `copy-coach-v2-frontend` |
| **Package Manager** | npm | Workspace monorepo (root + `frontend/`) |
| **Linting** | ESLint 9+ | Flat config with `eslint-config-next` |
| **Fonts** | Geist + Geist Mono | Via `next/font/google` |

## Project Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                      │
│  React 19 + Next.js Client Components                       │
│  ├─ Landing Page (page.tsx)                                  │
│  ├─ Dashboard (dashboard/page.tsx) - 2074 lines, monolithic │
│  ├─ Auth Pages (login, signup, callback)                     │
│  ├─ Profile Settings (dashboard/profile)                     │
│  ├─ Payment Success (payment/success)                        │
│  └─ Supabase Client (anon key) ──────────────────────────┐  │
└──────────────────────────────────────────────────────────┼──┘
                                                           │
                                                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     API ROUTES (Next.js Server)              │
│  ├─ /api/auth/* (signup, me, profile-sync)                   │
│  ├─ /api/improve ──────── Gemini → Groq → Mock fallback     │
│  ├─ /api/support ──────── Gemini → Groq → Hardcoded FAQ     │
│  ├─ /api/feedback ─────── Supabase + Email + Webhook        │
│  ├─ /api/paystack/* ───── Paystack API + HMAC verification  │
│  ├─ /api/download/* ───── APK manifest stub                 │
│  └─ /api/supabase-config ─ runtime config for client        │
│                                                              │
│  Auth: Bearer token → supabaseAdmin.auth.getUser()           │
│  Rate: Upstash Redis sliding window (in-memory fallback)     │
└──────┬──────────┬──────────┬──────────┬──────────────────────┘
       │          │          │          │
       ▼          ▼          ▼          ▼
┌──────────┐ ┌────────┐ ┌────────┐ ┌────────────┐
│ Supabase │ │Paystack│ │ Gemini │ │   Resend   │
│ Postgres │ │  API   │ │  API   │ │   Email    │
│ + Auth   │ │        │ │        │ │            │
└──────────┘ └────────┘ └────────┘ └────────────┘
```

### Auth Flow

```
Client → Supabase Auth (email/password or Google OAuth PKCE)
       → Stores session in localStorage
       → API calls include: Authorization: Bearer <access_token>
       → Server: supabaseAdmin.auth.getUser(token) → verified user
       → Identity ALWAYS derived from verified JWT, never from request body
```

### Payment Flow

```
Dashboard → POST /api/paystack/initialize → Paystack checkout URL
         → User pays (5,000 NGN) → Redirect to /payment/success
         → GET /api/paystack/verify → activateSubscription()
         → Webhook also fires → /api/paystack/webhook → activateSubscription()
         → Idempotent: 10-min duplicate window prevents double activation
```

## Directory Structure

```
CopyCoach-App/                          # Monorepo root
├── package.json                        # Workspace root (npm workspaces)
├── .env.example                        # Root env template (mirrors frontend/)
├── metadata.json                       # App capability metadata
├── docs/                               # Product specifications
│   ├── PRD.md.txt                      # Product Requirements Document
│   ├── Database.md.txt                 # Database schema spec (aspirational, not actual)
│   ├── Features.md.txt                 # Feature specifications
│   ├── BrandGuide.md.txt              # Brand identity guide
│   ├── Roadmap.md.txt                  # 5-phase development roadmap
│   ├── AI-Prompts.md.txt              # AI prompt architecture
│   └── COMPONENTS.md.txt              # Empty file
├── CopyCoach-V2-/                      # Archived V2 snapshot (reference only)
├── frontend/                           # Main Next.js application
│   ├── package.json                    # Frontend dependencies
│   ├── next.config.ts                  # Minimal Next.js config
│   ├── tsconfig.json                   # TypeScript config (strict, @/* alias)
│   ├── eslint.config.mjs              # ESLint 9 flat config
│   ├── postcss.config.mjs             # Tailwind CSS v4 PostCSS
│   ├── .env.example                    # Env var template (47 lines)
│   ├── CopyCoach-V2-/                  # Another V2 snapshot (reference only)
│   ├── src/
│   │   ├── app/                        # Next.js App Router
│   │   │   ├── layout.tsx              # Root layout (AnalyticsProvider, SentryErrorBoundary)
│   │   │   ├── page.tsx                # Landing page
│   │   │   ├── globals.css             # Design tokens (dark navy theme, Tailwind v4)
│   │   │   ├── error.tsx               # Error boundary
│   │   │   ├── global-error.tsx        # Global error boundary
│   │   │   ├── api/                    # API routes
│   │   │   │   ├── auth/               # signup, me, profile-sync
│   │   │   │   ├── improve/            # AI copy generation
│   │   │   │   ├── support/            # AI support chat
│   │   │   │   ├── feedback/           # Feedback CRUD
│   │   │   │   ├── paystack/           # initialize, verify, webhook
│   │   │   │   ├── download/           # APK manifest stub
│   │   │   │   └── supabase-config/    # Runtime config
│   │   │   ├── auth/                   # Login, signup, OAuth callback
│   │   │   ├── dashboard/              # Main app + admin + profile + projects
│   │   │   ├── payment/                # Payment success page
│   │   │   └── download/               # Mobile download landing page
│   │   ├── components/
│   │   │   ├── ui/                     # Reusable UI (Button, Card, Badge, Logo, modals)
│   │   │   ├── layout/                 # Navbar, Footer
│   │   │   ├── landing/                # Landing page sections
│   │   │   ├── dashboard/              # CategorySelector, ToneSelector, ProductDetails, etc.
│   │   │   └── providers/              # AnalyticsProvider, SentryErrorBoundary
│   │   ├── lib/                        # Server & shared utilities
│   │   │   ├── auth-server.ts          # getServerUser, isAdmin, getClientIdentifier
│   │   │   ├── supabase-admin.ts       # Service role client (server only)
│   │   │   ├── supabase.ts             # Client-side singleton with runtime config
│   │   │   ├── credits.ts              # Usage tracking (free 5/day, pro 100/mo)
│   │   │   ├── subscription.ts         # Pro activation, check, expire
│   │   │   ├── email.ts                # Resend/SMTP with developer notifications
│   │   │   ├── rate-limit.ts           # Sliding window limiter
│   │   │   ├── redis.ts                # Upstash KV with memory fallback
│   │   │   └── analytics.ts            # PostHog server events
│   │   └── instrumentation.ts          # Sentry server-side init
│   └── public/                         # Static assets
```

## Features

| Feature | Status | Notes |
|---------|--------|-------|
| Email/Password Auth | ✅ Complete | With complexity validation (6+ chars, uppercase, special) |
| Google OAuth | ✅ Complete | PKCE flow via Supabase |
| Landing Page | ✅ Complete | Hero, Features, HowItWorks, Testimonials, Pricing, FAQ, CTA, AppInfoAndSupport |
| AI Copy Generation | ✅ Complete | Gemini primary, Groq fallback, mock fallback chain |
| Copy Scoring (0-100) | ✅ Complete | Score, strengths, weaknesses, framework identification |
| AI Rewrite/Improvement | ✅ Complete | Improved copy + coaching advice |
| Copy History | ✅ Complete | Saved to Supabase, search, favorites, delete |
| Projects (Folders) | ✅ Complete | Create, rename, delete projects; assign history items |
| Free Tier (5/day) | ✅ Complete | Daily counter resets, enforced server-side |
| Pro Subscription (NGN 5k/mo) | ✅ Complete | 30-day window, auto-expiry, idempotent activation |
| Paystack Integration | ✅ Complete | Initialize, verify, webhook with HMAC-SHA512 |
| Profile Management | ✅ Complete | Name, avatar (Supabase Storage), role, company, bio |
| Brand Voice Settings | ✅ Complete | Default tone, language, target audience, brand niche |
| Theme (Dark/Light/System) | ✅ Complete | Tailwind CSS v4 design tokens, localStorage persistence |
| PDF Export | ✅ Complete | jsPDF with branded header |
| Copy-to-Clipboard | ✅ Complete | One-click copy with toast feedback |
| Rate Limiting | ✅ Complete | Upstash Redis sliding window, in-memory fallback |
| Developer Email Notifications | ✅ Complete | Resend/SMTP for support, feedback, bugs |
| Admin Feedback Dashboard | ✅ Complete | Admin-only panel at /dashboard/admin/feedback |
| AI Support Chat | ✅ Complete | Chat-style Q&A via /api/support |
| Drill Critique Feedback | ✅ Complete | Thumbs up/down + category + comment on AI output |
| Mobile App Download | ✅ Complete | Google Play, Apple App Store links, APK stub, QR placeholder |
| PostHog Analytics | ✅ Complete | Client + server events (signup, generation, upgrade) |
| Sentry Error Tracking | ✅ Complete | Server instrumentation + client ErrorBoundary |
| Supabase Config Hydration | ✅ Complete | Runtime config fetching for client-side Supabase |
| PDF Export of Optimized Copy | ✅ Complete | Branded A4 PDF generation |
| Keyboard Shortcuts | ✅ Complete | Shown in modal, keyboard-driven actions |
| Gamification (XP, Levels) | 🔴 Not Started | Defined in docs/Features.md.txt, not implemented |
| Achievements/Badges | 🔴 Not Started | Defined in docs, no DB tables |
| Daily Challenges | 🔴 Not Started | Defined in docs/AI-Prompts.md.txt, not implemented |
| Learning Mode | 🔴 Not Started | Defined in docs, not implemented |
| Community Features | 🔴 Not Started | Phase 3 in Roadmap.md.txt |
| Real Mobile Apps | 🔴 Not Started | Currently PWA/placeholder only |
| Voice Coaching | 🔴 Not Started | Phase 5 in roadmap |
| Multi-seat/Agency | 🔴 Not Started | Pricing tier exists but not implemented |

## Completed Work

### Authentication System
- Email/password signup with server-side validation and complexity rules
- Google OAuth with PKCE flow
- Profile sync on OAuth callback
- Server-side Bearer token verification on all protected routes
- Session persistence in localStorage

### Core AI Engine
- `/api/improve` endpoint with Gemini → Groq → mock fallback chain
- JSON-structured AI responses: score, strengths, weaknesses, framework, improvedCopy, coachAdvice
- Credit enforcement before generation, consumption after success
- Rate limiting (30/min per user)

### Payment System
- Paystack initialize/verify/webhook trifecta
- HMAC-SHA512 webhook signature verification (fail-closed)
- Idempotent subscription activation with 10-minute duplicate window
- Auto-expiry of subscriptions past their expiration date
- 5,000 NGN Pro plan (hardcoded)

### Security Hardening
- All auth-sensitive logic server-side in API routes
- User identity ALWAYS derived from verified JWT, never request body
- Rate limiting on all mutating endpoints
- Admin access gating via `ADMIN_EMAILS` env var
- Password complexity validation on signup

### Infrastructure
- Resend email with SMTP fallback
- Upstash Redis with in-memory fallback
- PostHog analytics (client + server)
- Sentry error tracking (server + client)
- Vercel deployment

## Work In Progress

### Dashboard Component Decomposition
- **What**: The main `dashboard/page.tsx` is 2074 lines and contains the entire app experience as a single monolithic client component
- **Where**: `frontend/src/app/dashboard/page.tsx`
- **What remains**: Breaking this into smaller, focused components (CopyGenerator, OutputPanel, HistoryGrid, StatsCards, ProfileModal, etc.)
- **Known limitations**: No external state management library; all 40+ useState hooks managed locally

### Real QR Code Generation
- **What**: QR codes in DownloadAppModal and AppInfoAndSupport are static SVG placeholders
- **Where**: `frontend/src/components/ui/DownloadAppModal.tsx`, `frontend/src/components/landing/AppInfoAndSupport.tsx`
- **What remains**: Need a QR code library (e.g., `qrcode.react`) to generate real PWA install URLs

### CTA Button Link
- **What**: The "Start Learning Free" button on the landing page CTA section has no `href`
- **Where**: `frontend/src/components/landing/CTA.tsx`
- **What remains**: Add `href="/auth/signup"` to the Button component

### FAQ Accordion
- **What**: FAQ answers are always visible; not interactive accordion despite design intent
- **Where**: `frontend/src/components/landing/FAQ.tsx`
- **What remains**: Add expand/collapse state management

## Not Yet Implemented

These features are defined in project documentation but have no implementation:

1. **Gamification System** (docs/Features.md.txt, docs/Database.md.txt): XP points, user levels, streaks, achievements/badges, `achievements` and `user_achievements` tables
2. **Learning Mode** (docs/AI-Prompts.md.txt): Dedicated learning flow separate from copy generation
3. **Daily Challenges** (docs/AI-Prompts.md.txt): AI-generated daily copywriting challenges
4. **Rewrite Evaluation** (docs/AI-Prompts.md.txt): Separate evaluation for user rewrites
5. **Community Features** (docs/Roadmap.md.txt Phase 3): User interactions, sharing, leaderboards
6. **Real Mobile Apps** (docs/Roadmap.md.txt Phase 5): Native iOS/Android applications
7. **Voice Coaching** (docs/Roadmap.md.txt Phase 5): Audio-based coaching
8. **Freelance Marketplace** (docs/Roadmap.txt Phase 5): Client-freelancer matching
9. **Agency Version** (docs/Roadmap.txt Phase 5): Multi-seat team features (pricing tier exists but no backend)
10. **COMPONENTS.md** (docs/COMPONENTS.md.txt): Component documentation file is empty

## Architecture Decisions

1. **No middleware for auth**: The project deliberately does NOT use Next.js middleware for auth. All auth verification is done in API routes via Bearer token verification. Client-side redirects handle unauthenticated page access.

2. **Server-side identity from JWT only**: User identity is ALWAYS derived from the verified Supabase JWT token, never from request body fields. This prevents identity spoofing.

3. **AI fallback chain**: Every AI endpoint follows Gemini → Groq → hardcoded mock. The app never completely fails even with no AI keys configured.

4. **Paystack for payments**: Chosen for NGN (Nigerian Naira) payment processing. The Pro plan costs 5,000 NGN/month.

5. **Supabase for everything**: Auth, database, and file storage all through Supabase. Uses service role key server-side (bypasses RLS).

6. **No external state management**: All state is local React state (useState/useCallback). No Redux, Zustand, or similar. The dashboard page manages 40+ state variables.

7. **Tailwind CSS v4**: Uses the new `@tailwindcss/postcss` plugin and `@theme inline {}` syntax.

8. **Graceful degradation**: Every external service (AI, email, Redis, analytics, Sentry) degrades gracefully when its API key is missing.

9. **Monorepo with npm workspaces**: Root `package.json` defines `frontend` as workspace. Build commands delegate via `--workspace=frontend`.

10. **Client-side Supabase with runtime config**: The client Supabase instance uses a Proxy-based lazy initialization pattern, fetching config from `/api/supabase-config` at runtime.

## Integrations

| Service | Purpose | Key Files | Status |
|---------|---------|-----------|--------|
| **Supabase** | Auth, Database, Storage | `lib/supabase.ts`, `lib/supabase-admin.ts` | ✅ Active |
| **Google Gemini** | AI copy generation & support | `app/api/improve/route.ts`, `app/api/support/route.ts` | ✅ Primary AI |
| **Groq** | AI fallback provider | Same as Gemini | ✅ Fallback |
| **Paystack** | Payment processing | `app/api/paystack/*` | ✅ Active |
| **Resend** | Email notifications | `lib/email.ts` | ✅ Preferred |
| **Nodemailer/SMTP** | Email fallback | `lib/email.ts` | ✅ Fallback |
| **Upstash Redis** | Rate limiting + caching | `lib/redis.ts`, `lib/rate-limit.ts` | ✅ Production |
| **PostHog** | Analytics | `lib/analytics.ts`, `components/providers/AnalyticsProvider.tsx` | ✅ Active |
| **Sentry** | Error tracking | `instrumentation.ts`, `components/providers/SentryErrorBoundary.tsx` | ✅ Active |
| **Vercel** | Hosting/deployment | `.vercel/project.json` | ✅ Deployed |

## Environment Variables

All variables are documented in `frontend/.env.example`. Names only:

### Required
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase public anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Server-only admin key (never expose client-side)
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` - Paystack client-side key (note: `.env.example` uses `PAYSTACK_PUBLIC_KEY`)
- `PAYSTACK_SECRET_KEY` - Paystack server-side key for HMAC + verification

### AI
- `GEMINI_API_KEY` - Google Gemini API key (preferred AI provider)
- `GROQ_API_KEY` - Groq API key (fallback AI provider)

### Optional but Important for Production
- `NEXT_PUBLIC_APP_URL` - Production URL for Paystack callbacks
- `RESEND_API_KEY` - Enables Resend email; otherwise SMTP fallback
- `RESEND_FROM_EMAIL` - Sender email address
- `SUPPORT_EMAIL` - Support contact email
- `DEVELOPER_EMAIL` - Destination for developer notification emails (defaults to `slastbornn@gmail.com`)
- `ADMIN_EMAILS` - Comma-separated admin emails for admin dashboard access
- `ADMIN_WEBHOOK_URL` - Optional webhook for feedback (Slack/Discord/Zapier)
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` - Distributed rate limiting
- `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST` - Analytics
- `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` - Error tracking

### SMTP Fallback (when Resend unavailable)
- `SMTP_HOST` (default: `smtp.gmail.com`)
- `SMTP_PORT` (default: `587`)
- `SMTP_USER` / `SMTP_PASS`

## Important Files

| File | Why It Matters |
|------|---------------|
| `frontend/src/app/dashboard/page.tsx` | **The most important file.** 2074-line monolithic dashboard containing the entire app experience. Any feature change likely touches this file. |
| `frontend/src/app/api/improve/route.ts` | Core AI generation endpoint. Handles scoring, rewriting, coaching. Gemini→Groq→Mock chain. |
| `frontend/src/lib/auth-server.ts` | Auth verification pattern. ALL API routes depend on this. Never modify `getServerUser` without understanding downstream effects. |
| `frontend/src/lib/credits.ts` | Credit/usage enforcement. Free 5/day, Pro 100/month. Auto-reset logic. |
| `frontend/src/lib/subscription.ts` | Pro subscription activation with idempotency guard. Critical for payment flow. |
| `frontend/src/app/api/paystack/webhook/route.ts` | Payment webhook with HMAC verification. Fail-closed security model. |
| `frontend/src/lib/email.ts` | Email abstraction with Resend→SMTP fallback. Used by support and feedback. |
| `frontend/src/lib/rate-limit.ts` | Rate limiter with Redis→memory fallback. Used by most API routes. |
| `frontend/src/app/globals.css` | Design token system. All theme colors, shadows, and custom utilities defined here. |
| `frontend/src/lib/supabase.ts` | Client-side Supabase with runtime config proxy pattern. |
| `frontend/src/lib/supabase-admin.ts` | Server-side Supabase with service role. Bypasses RLS. |
| `frontend/CLAUDE.md` | Points to AGENTS.md for Next.js-specific rules. |
| `frontend/AGENTS.md` | Warning: This Next.js version has breaking changes from training data. |

## Known Bugs / Problems

### Confirmed Bugs
1. **CTA button has no link**: `frontend/src/components/landing/CTA.tsx` renders a Button without `href`, so "Start Learning Free" does nothing.
2. **APK download is a stub**: `/api/download/android-apk` returns a JSON manifest, not an actual APK binary.
3. **QR codes are placeholders**: Static SVGs in DownloadAppModal and AppInfoAndSupport, not real QR codes.

### Suspected Issues
1. **2FA toggle is cosmetic**: In `dashboard/profile/page.tsx`, the 2FA toggle is a client-side boolean not connected to any real 2FA system.
2. **Support ticket in profile is simulated**: The support form in profile settings uses `setTimeout` to simulate submission, no actual API call.
3. **No middleware auth protection**: Client-side redirects handle auth, but direct URL access to protected pages may show a flash of content before redirect.
4. **FAQ not interactive**: Answers always visible despite accordion-like design.
5. **`/api/supabase-config` has no rate limiting**: Could be abused, though the anon key is designed for public use.

### Incomplete Implementations
1. **Dashboard decomposition**: The 2074-line `dashboard/page.tsx` needs to be split into smaller components.
2. **docs/COMPONENTS.md**: Empty file, no component documentation.
3. **Pricing mismatch**: Landing page pricing (USD, 4 tiers) differs from actual Paystack implementation (NGN, single Pro tier).

## TODO

### High Priority
1. Decompose `dashboard/page.tsx` into smaller components (CopyGenerator, OutputPanel, HistoryGrid, StatsCards, ProfileModal)
2. Fix CTA button link (`href="/auth/signup"`) in `CTA.tsx`
3. Implement real QR code generation for PWA install
4. Fix FAQ accordion (add expand/collapse)

### Medium Priority
1. Add component documentation to `docs/COMPONENTS.md`
2. Reconcile pricing display (landing page vs actual implementation)
3. Add real 2FA support or remove the cosmetic toggle
4. Add actual support ticket submission in profile settings
5. Add rate limiting to `/api/supabase-config`
6. Add a `middleware.ts` for server-side auth protection on page routes

### Low Priority
1. Implement gamification (XP, levels, achievements) - large feature
2. Implement daily challenges - medium feature
3. Implement learning mode - large feature
4. Implement community features - large feature
5. Build real native mobile apps - large feature
6. Implement voice coaching - large feature
7. Clean up V2 snapshot directories (`CopyCoach-V2-/` at root and in `frontend/`)

## Development Instructions

1. **Inspect before modifying**: Always read the existing implementation before making changes. The codebase has specific patterns (auth verification, credit checking, rate limiting) that must be preserved.

2. **Reuse existing architecture**: Follow the established patterns for API routes (Bearer token auth, rate limiting, AI fallback chain). Do not introduce new patterns.

3. **Never modify auth without care**: `getServerUser()` in `auth-server.ts` is the single source of truth for server-side identity. All API routes depend on it. Never bypass it.

4. **Preserve the AI fallback chain**: Gemini → Groq → Mock. Always maintain this pattern in AI endpoints.

5. **Check related files**: Before modifying any feature, understand the full chain (component → API route → lib → database).

6. **Test payment flow carefully**: Paystack webhook + verify + idempotent activation is complex. Changes here can cause double charges or missed activations.

7. **Never expose secrets**: Service role key, Paystack secret key, API keys must never appear in client-side code or logs.

8. **Respect rate limits**: When adding new API endpoints, apply appropriate rate limiting using the existing `getRateLimiter()` pattern.

9. **Tailwind CSS v4**: This project uses Tailwind v4 syntax (`@import "tailwindcss"`, `@theme inline {}`). Do not use v3 patterns.

10. **Next.js 16**: Per `AGENTS.md`, this version has breaking changes. Check `node_modules/next/dist/docs/` before writing Next.js-specific code.

11. **Check for `CopyCoach-V2-` directories**: These are archived snapshots. Never modify or treat them as active code.

## Agent Takeover Instructions

This is an existing, actively-developed project with a substantial codebase. You are taking over from previous development work.

**Before doing ANY work:**
1. Read this `PROJECT_CONTEXT.md` thoroughly.
2. Read `AGENT_HANDOFF.md` for the latest session state.
3. Inspect the relevant existing code before making changes.
4. Understand the auth pattern (Bearer token → getServerUser → verified identity).
5. Understand the AI fallback chain (Gemini → Groq → Mock).
6. Understand the credit system (free 5/day, pro 100/month).
7. Understand the payment flow (Paystack initialize → redirect → verify/webhook → activateSubscription).

**Critical rules:**
- Do NOT start from scratch. The project has substantial working functionality.
- Do NOT rewrite working features without a clear reason.
- Do NOT introduce duplicate systems (e.g., a second auth system, a second rate limiter).
- Do NOT remove the AI fallback chain.
- Do NOT expose secrets in client-side code.
- DO preserve existing integrations and patterns.
- DO check related files before modifying functionality.
- DO update this documentation when making significant changes.

## Documentation Maintenance Rule

Whenever an agent:

- Completes a feature
- Starts a major feature
- Changes architecture
- Changes an integration
- Fixes an important bug
- Discovers an important issue
- Changes deployment
- Changes database structure
- Changes authentication
- Changes payment behavior

the agent must update `PROJECT_CONTEXT.md`.

Whenever an agent finishes a work session, it must update `AGENT_HANDOFF.md` so the next agent knows exactly where to continue.

**MODERN ESSENTIALS**

Company Blueprint & Technical Reference

Subscription-first D2C fresh essentials brand - Start with eggs, expand to dairy

| **Field** | **Value**                                        |
| --------- | ------------------------------------------------ |
| Version   | 2.0 - Updated March 2026                         |
| Status    | Living Document - update on every major decision |
| Stack     | Next.js + NestJS + PostgreSQL + Turborepo        |
| Author    | Founder / CTO                                    |

This document is the single source of truth for product, technology, and operational decisions. It covers everything from Day 0 setup to Phase 4 scaling. Update it when decisions change. An outdated blueprint is worse than no blueprint.

# **Table of Contents**

# **1\. Company Vision & Brand**

## **1.1 Mission**

Build India's most trusted subscription-first fresh essentials brand - starting with eggs - where every product carries radical transparency in sourcing, pricing, and quality.

## **1.2 Brand Pillars**

| **Pillar**             | **What it means in practice**                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Transparency           | Cost breakdown visible per product. Farm-level sourcing on every package. QR code links to batch traceability page. |
| Honest marketing       | No vague claims like 'natural' or 'farm fresh' without proof. All nutrition data lab-verified.                      |
| Premium + fair pricing | Better quality than local market. More honest than large FMCG brands. Subscription saves customer money.            |
| Subscription-first     | Default purchase mode is subscription. The entire UX optimises for this. One-time is available but de-emphasised.   |

## **1.3 Product Expansion Roadmap**

| **Phase**     | **Products**                                  | **Timeline** |
| ------------- | --------------------------------------------- | ------------ |
| 1 - Launch    | Eggs: Regular, Brown, High-Protein (3-4 SKUs) | Month 0-6    |
| 2 - Dairy     | Milk, Paneer, Curd                            | Month 6-18   |
| 3 - Ecosystem | Ghee, Cold-pressed oils, Honey                | Month 18+    |

# **2\. Business Model**

## **2.1 Revenue Streams**

- **Subscriptions (core): Weekly or monthly recurring delivery. Discounted vs one-time.**
- One-time purchases: Available but UX actively nudges toward subscription.
- Bundles: Curated packs (Breakfast Bundle, High-Protein Pack).
- Membership tier (Phase 3): Annual fee for deeper discounts + priority delivery.

## **2.2 North Star Metric**

Repeat purchase rate - NOT first order GMV. Every product, UX, and ops decision must be measured against this. An order from a subscriber in month 6 is worth 10x an acquired first order.

## **2.3 Unit Economics Targets**

| **Metric**                | **Year 1 Target** | **Why it matters**                                                    |
| ------------------------- | ----------------- | --------------------------------------------------------------------- |
| Gross Margin              | 35-45%            | Perishables have high COGS. Subscription mix improves this over time. |
| Subscriber LTV (12-month) | \> 5x CAC         | Minimum viable retention signal.                                      |
| Monthly Churn             | < 8%              | Eggoz benchmark. Above 12% means broken product or delivery.          |
| Avg Order Value           | Rs 280-380        | Egg subscription + upsell to dairy.                                   |
| CAC (Instagram)           | Rs 150-280        | Influencer + organic SEO focus.                                       |
| Razorpay fees             | ~2% of GMV        | Baked into COGS. Budget for this from Day 1.                          |

# **3\. Platform Module Map**

21 modules across 7 domains. BUILD = custom code. BUY = third-party SaaS wired via API. Never build what can be bought cheaply.

## **3.1 Customer-Facing**

| **Module**               | **Build/Buy** | **Tool / Tech**                  | **Priority** |
| ------------------------ | ------------- | -------------------------------- | ------------ |
| Storefront + catalog     | BUILD         | Next.js 14, Tailwind, shadcn/ui  | P0 - Week 1  |
| Subscription engine      | BUILD         | NestJS + BullMQ + PostgreSQL FSM | P0 - Week 3  |
| Loyalty + rewards ledger | BUILD         | Append-only ledger in PostgreSQL | P1 - Month 2 |
| Customer support         | BUY           | Freshdesk (tickets + WhatsApp)   | P0 - Day 1   |
| CMS + farm stories       | BUY           | Sanity.io (headless CMS)         | P1 - Month 2 |
| Marketplace integrations | BUY           | Unicommerce adapter layer        | P2 - Month 6 |

## **3.2 Supply Chain**

| **Module**                    | **Build/Buy** | **Tool / Tech**                    | **Priority**            |
| ----------------------------- | ------------- | ---------------------------------- | ----------------------- |
| Procurement + farm management | BUILD (lite)  | Ops dashboard module + PostgreSQL  | P1 - Month 2            |
| Quality control + batch log   | BUILD         | Ops dashboard QC module            | P0 - Before first order |
| Cold chain monitoring         | BUILD (lite)  | Manual log + threshold alert rules | P1 - Month 1            |

## **3.3 Warehouse & Inventory**

| **Module**                    | **Build/Buy** | **Tool / Tech**                          | **Priority**            |
| ----------------------------- | ------------- | ---------------------------------------- | ----------------------- |
| Inventory management (FEFO)   | BUILD         | Custom PostgreSQL - FEFO logic mandatory | P0 - Before first order |
| WMS - pick, pack, dispatch    | BUILD (lite)  | Ops dashboard module                     | P1 - Month 1            |
| Packaging material management | BUILD         | BOM table in PostgreSQL                  | P1 - Month 2            |

## **3.4 Shipping & Last-Mile**

| **Module**                     | **Build/Buy**   | **Tool / Tech**                                    | **Priority**       |
| ------------------------------ | --------------- | -------------------------------------------------- | ------------------ |
| Shipping integrations          | BUY             | Shadowfax Hyperlocal (primary), Delhivery (backup) | P0 - Before launch |
| Fleet + delivery agent tooling | BUILD (Phase 2) | Delivery agent PWA + route optimization            | P2 - Month 6       |
| Dark store / hub management    | BUILD (Phase 2) | Hub inventory + order routing module               | P2 - Month 9       |

## **3.5 Operations & Finance**

| **Module**              | **Build/Buy** | **Tool / Tech**                              | **Priority**            |
| ----------------------- | ------------- | -------------------------------------------- | ----------------------- |
| Ops admin dashboard     | BUILD         | Internal Next.js app at admin.yourdomain.com | P0 - Before first order |
| Finance + GST invoicing | BUY           | Zoho Books (GST-ready, Razorpay sync)        | P0 - Before first order |
| Analytics + BI          | BUY           | PostHog (product) + Metabase (ops BI)        | P1 - Month 2            |

# **4\. Technology Stack**

Stack decision: NestJS over Fastify. Rationale: you are comfortable with NestJS, its opinionated structure pays dividends as the codebase grows to 20+ modules, hiring is easier, and Jest + Swagger are first-class. The performance difference (~15-20% raw throughput) is irrelevant at this scale. No cost difference on Railway.

## **4.1 Chosen Stack**

| **Layer**         | **Technology**                                              | **Rationale**                                                                 |
| ----------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Storefront (web)  | Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui | SEO via RSC, PWA-ready, fast DX. Deployed on Vercel.                          |
| Admin dashboard   | Next.js 14 (internal app)                                   | Reuses same stack. Deployed as separate Vercel project.                       |
| Backend API       | NestJS + TypeScript + class-validator + Swagger             | Structured modules, DI container, built-in Jest, auto OpenAPI docs.           |
| ORM               | Prisma + PostgreSQL                                         | Schema-first. Migrations versioned in repo. Type-safe queries.                |
| Database          | PostgreSQL on Railway                                       | Single source of truth. FEFO, FSM state, ledger, all here.                    |
| Background jobs   | BullMQ on Upstash Redis                                     | Subscription renewals, dunning retries, notification dispatch.                |
| Auth              | Clerk                                                       | Never hand-roll sessions. Handles refresh tokens, OTP, social login.          |
| Payments          | Razorpay Subscriptions API                                  | UPI autopay mandates, e-NACH, RBI pre-debit notification - built in.          |
| Email             | Resend + React Email                                        | Transactional email. React Email templates live in packages/email.            |
| WhatsApp          | Interakt                                                    | Best WhatsApp Business API provider for India. Template messages + bot flows. |
| Storage           | Cloudflare R2                                               | Zero egress fees. Farm photos, product images, label PDFs.                    |
| CDN               | Cloudflare                                                  | DDoS, edge caching, DNS. Free plan covers Year 1.                             |
| Monitoring        | Sentry + Logtail                                            | Error tracking + structured logs. Both have generous free tiers.              |
| Product analytics | PostHog                                                     | Funnels, session recording, feature flags. 1M events/mo free.                 |
| Ops BI            | Metabase (self-hosted)                                      | Connects to Postgres read replica. Zero cost - open source.                   |
| Infra             | Vercel (frontend) + Railway (backend)                       | Zero-ops deployment. Railway runs NestJS, Postgres, Redis, Metabase.          |
| CI/CD             | GitHub Actions + Turborepo remote cache                     | Test → build → deploy on push to main. Cache skips unchanged packages.        |

## **4.2 Rejected Alternatives & Why**

| **Rejected**           | **Use Instead**               | **Reason**                                                                            |
| ---------------------- | ----------------------------- | ------------------------------------------------------------------------------------- |
| Fastify                | NestJS                        | Less structure for a multi-module codebase. Worth the slight performance trade-off.   |
| NestJS on serverless   | NestJS on Railway (always-on) | NestJS cold starts are painful on Lambda/Edge. Railway containers have no cold start. |
| Shopify / Dukaan       | Custom build                  | Cannot own subscription lifecycle or rewards engine on these platforms.               |
| Shiprocket (primary)   | Shadowfax Hyperlocal          | Built for non-perishables. No meaningful same-day SLA guarantee for eggs.             |
| DIY JWT auth           | Clerk                         | Security gaps without proper refresh token + rotation strategy.                       |
| Upstash Redis on Day 1 | Add after Week 4              | Add when BullMQ jobs are ready. Premature before that.                                |
| Meilisearch            | Postgres full-text search     | Postgres handles hundreds of SKUs easily. Add Meilisearch at 500+ products.           |
| Custom GST invoicing   | Zoho Books                    | Compliance is not your moat. Zoho handles GST returns automatically.                  |
| Custom CMS             | Sanity.io                     | 6 weeks of build for something Sanity solves in one afternoon.                        |
| TypeORM                | Prisma                        | Prisma's generated client is type-safe end-to-end. TypeORM requires manual typing.    |
| Nx                     | Turborepo                     | Turborepo is simpler for a two-app monorepo. Nx adds overhead you don't need yet.     |

# **5\. Monorepo & Development Toolchain**

Use Turborepo + pnpm workspaces. One repo, three apps (web, api, admin), shared packages for types, utils, email templates, and Prisma schema. This is the standard for TypeScript full-stack monorepos in 2024-26.

## **5.1 Repository Structure**

modern-essentials/ # root

├── apps/

│ ├── web/ # Next.js 14 - customer storefront

│ ├── api/ # NestJS - backend API

│ └── admin/ # Next.js 14 - ops dashboard (internal)

├── packages/

│ ├── db/ # Prisma schema + migrations + generated client

│ ├── types/ # Shared TypeScript interfaces + Zod schemas

│ ├── utils/ # Shared helpers (date, currency, FEFO logic)

│ ├── email/ # React Email templates

│ └── config/ # ESLint, Prettier, TS base configs

├── turbo.json # Build pipeline: lint → test → build

├── pnpm-workspace.yaml

├── package.json # Root workspace definition

└── .cursorrules # AI coding assistant instructions

## **5.2 NestJS API Module Structure**

apps/api/src/

├── main.ts # Bootstrap: Fastify adapter, Swagger, CORS

├── app.module.ts # Root module - imports all feature modules

├── modules/

│ ├── identity/ # Users, sessions, addresses

│ │ ├── identity.module.ts

│ │ ├── identity.controller.ts # Route handlers

│ │ ├── identity.service.ts # Business logic

│ │ └── identity.dto.ts # class-validator DTOs

│ ├── catalog/ # Products, SKUs, pricing

│ ├── orders/ # Order FSM, line items

│ ├── subscriptions/ # Sub FSM, billing schedule

│ ├── inventory/ # Batches, FEFO, wastage

│ ├── ledger/ # Points events, balances

│ ├── logistics/ # Slots, dispatch, tracking

│ ├── notifications/ # Email + WhatsApp queue

│ ├── finance/ # Invoice generation, reconciliation

│ └── webhooks/ # Razorpay + Interakt + Shadowfax

├── common/

│ ├── guards/ # Auth guards (Clerk JWT verification)

│ ├── interceptors/ # Logging, response transform

│ ├── filters/ # Global exception filter

│ └── decorators/ # @CurrentUser(), @Roles()

└── jobs/

├── subscription-renewal.job.ts # BullMQ worker: fires on next_billing_at

├── dunning.job.ts # BullMQ worker: retry failed payments

└── notification-dispatch.job.ts # BullMQ worker: email + WhatsApp queue

## **5.3 Development Toolchain**

| **Tool**                | **Purpose**                                                   | **Config location**                |
| ----------------------- | ------------------------------------------------------------- | ---------------------------------- |
| pnpm                    | Package manager + workspace orchestration                     | pnpm-workspace.yaml (root)         |
| Turborepo               | Monorepo build orchestration + remote cache                   | turbo.json (root)                  |
| TypeScript 5.x (strict) | Type safety across all apps + packages                        | packages/config/tsconfig.base.json |
| ESLint                  | Linting - shared config used by all apps                      | packages/config/eslint-base.js     |
| Prettier                | Formatting - enforced on save + pre-commit                    | packages/config/prettier.config.js |
| Husky + lint-staged     | Pre-commit hook: lint + format only changed files             | .husky/pre-commit                  |
| Commitlint              | Enforces conventional commits (feat:, fix:, chore:)           | commitlint.config.js (root)        |
| Prisma                  | ORM + migrations. Schema lives in packages/db/schema.prisma   | packages/db/                       |
| Jest                    | Unit + integration tests for NestJS API                       | apps/api/jest.config.ts            |
| Vitest                  | Unit tests for Next.js apps (faster than Jest for Vite-based) | apps/web/vitest.config.ts          |
| Playwright              | E2E tests: checkout flow, subscription toggle, dunning        | e2e/ (root level)                  |
| Cursor                  | Primary IDE with AI pair programming                          | .cursorrules (root)                |
| GitHub Actions          | CI pipeline: lint → test → build → deploy                     | .github/workflows/                 |

## **5.4 Local Development Setup (Day 0 Onboarding)**

Any developer (including your future hires) should be able to clone the repo and have a running local environment in under 10 minutes. This section IS that guide.

_Prerequisites: Node.js 20+, pnpm 9+, Docker Desktop (for local Postgres + Redis)_

- **Clone and install**

git clone <https://github.com/your-org/modern-essentials>

cd modern-essentials

pnpm install

- **Start local services (Postgres + Redis via Docker)**

docker compose up -d

\# docker-compose.yml is at repo root

\# Postgres: localhost:5432 Redis: localhost:6379

- **Set up environment variables**

cp .env.example .env

# Fill in values - see Section 5.5 for full env var catalogue

# Note: A single .env at the root is shared across all apps via symlinks.

- **Run database migrations + seed**

cd packages/db

pnpm prisma migrate dev

pnpm prisma db seed # seeds test products + a test user

- **Start all apps in parallel**

\# From repo root:

pnpm dev

\# Turborepo starts all three in parallel:

\# web → <http://localhost:3000>

\# api → <http://localhost:4000> (Swagger: /api/docs)

\# admin → <http://localhost:3001>

## **5.5 Environment Variables Catalogue**

_A single `.env` file at the repository root contains all configuration for all applications and packages. Symlinks in each directory point back to this root file for local development._

### **Repository Root: .env**

| **Variable**            | **Description**                   | **Where to get it**                      |
| ----------------------- | --------------------------------- | ---------------------------------------- |
| DATABASE_URL            | PostgreSQL connection string      | Railway dashboard → Postgres → Connect   |
| REDIS_URL               | Upstash Redis connection URL      | Upstash console → REST URL               |
| CLERK_SECRET_KEY        | Server-side Clerk API key         | Clerk dashboard → API Keys               |
| CLERK_WEBHOOK_SECRET    | Clerk webhook signing secret      | Clerk dashboard → Webhooks               |
| RAZORPAY_KEY_ID         | Razorpay API key ID               | Razorpay dashboard → Settings → API Keys |
| RAZORPAY_KEY_SECRET     | Razorpay API secret               | Razorpay dashboard → Settings → API Keys |
| RAZORPAY_WEBHOOK_SECRET | Razorpay webhook signature secret | Razorpay dashboard → Webhooks            |
| RESEND_API_KEY          | Resend transactional email key    | Resend dashboard → API Keys              |
| INTERAKT_API_KEY        | Interakt WhatsApp API key         | Interakt dashboard → Developer → API Key |
| SHADOWFAX_API_KEY       | Shadowfax shipping API key        | Shadowfax partner portal                 |
| R2_ACCESS_KEY_ID        | R2 storage access key             | Cloudflare → R2 → Manage API Tokens      |
| R2_SECRET_ACCESS_KEY    | R2 storage secret key             | Cloudflare → R2 → Manage API Tokens      |
| R2_BUCKET_NAME          | R2 bucket name (e.g. me-assets)   | Cloudflare → R2                          |
| R2_ENDPOINT             | R2 S3-compatible endpoint URL     | Cloudflare → R2 → Bucket details         |
| SENTRY_DSN              | Sentry error reporting DSN        | Sentry project → Settings → Client Keys  |
| NODE_ENV                | development / production / test   | Set manually per environment             |
| PORT                    | API server port (default: 4000)   | 4000 local, set by Railway in prod       |
| FRONTEND_URL            | Storefront origin for CORS        | <http://localhost:3000> local            |
| ADMIN_URL               | Admin dashboard origin for CORS   | <http://localhost:3001> local            |

| **Next.js Public Variables**      | **Description**                                  | **Where to get it**                                 |
| --------------------------------- | ------------------------------------------------ | --------------------------------------------------- |
| NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY | Clerk client-side publishable key                | Clerk dashboard → API Keys                          |
| CLERK_SECRET_KEY                  | Clerk secret (used in Next.js server components) | Clerk dashboard → API Keys                          |
| NEXT_PUBLIC_API_URL               | Backend API base URL                             | <http://localhost:4000> local / Railway URL in prod |
| NEXT_PUBLIC_RAZORPAY_KEY_ID       | Razorpay key ID (safe to expose to browser)      | Razorpay dashboard                                  |
| NEXT_PUBLIC_POSTHOG_KEY           | PostHog project API key                          | PostHog project → Settings                          |
| NEXT_PUBLIC_POSTHOG_HOST          | PostHog ingestion host                           | <https://app.posthog.com>                           |
| SANITY_PROJECT_ID                 | Sanity CMS project ID                            | Sanity dashboard → Project settings                 |
| SANITY_DATASET                    | Sanity dataset name (production)                 | Sanity dashboard                                    |
| SANITY_API_TOKEN                  | Sanity read token for server-side fetches        | Sanity → Manage → API Tokens                        |

## **5.6 CI/CD Pipeline**

| **Step**     | **Tool**                            | **What it does**                                              |
| ------------ | ----------------------------------- | ------------------------------------------------------------- |
| Trigger      | GitHub Actions                      | Fires on every push to main and every pull request            |
| Lint         | Turborepo → ESLint                  | Lints only changed packages (Turborepo cache skips unchanged) |
| Type check   | tsc --noEmit                        | Validates types across all apps and shared packages           |
| Unit tests   | Jest (api) + Vitest (web)           | Runs test suites. PR blocked if any test fails.               |
| Build        | Turborepo → next build + nest build | Production build for all apps                                 |
| Deploy web   | Vercel GitHub integration           | Auto-deploys storefront on merge to main                      |
| Deploy admin | Vercel GitHub integration           | Auto-deploys ops dashboard on merge to main                   |
| Deploy api   | Railway GitHub integration          | Auto-deploys NestJS on merge to main                          |
| Migrate DB   | Railway deploy hook                 | Runs: prisma migrate deploy before app starts                 |
| E2E tests    | Playwright (nightly)                | Runs checkout + subscription flow against staging env         |

# **6\. System Architecture**

## **6.1 Module Ownership Boundaries**

The backend is a single NestJS monolith at launch. Do not split into microservices until a module has a genuinely different scaling requirement. Premature extraction adds deployment complexity with zero customer benefit.

| **Module**    | **Owns**                                          | **Never Touches**                    |
| ------------- | ------------------------------------------------- | ------------------------------------ |
| Identity      | Users, sessions, addresses, roles                 | Orders, pricing, payments            |
| Catalog       | Products, SKUs, pricing rules, images             | Inventory levels, orders             |
| Orders        | Order FSM, line items, order status               | Payment capture, inventory           |
| Subscriptions | Sub FSM, billing schedule, dunning                | Payment capture, catalog             |
| Inventory     | Stock levels, batches, FEFO, wastage              | Orders, subscriptions                |
| Ledger        | Points events, balances, referrals                | Fulfillment, billing                 |
| Logistics     | Slots, dispatch assignments, tracking             | Billing, loyalty                     |
| Notifications | Email + WhatsApp queue, templates                 | Any business logic                   |
| Finance       | Invoice generation, reconciliation hooks          | Product or fulfillment               |
| Webhooks      | Inbound events from Razorpay, Interakt, Shadowfax | Nothing - delegates to other modules |

## **6.2 Core Database Schema**

| **Table**         | **Critical Fields**                                                                                 | **Design Notes**                                                  |
| ----------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| users             | id, phone, email, clerk_id, tier, created_at                                                        | Phone is primary login in India. clerk_id links to Clerk.         |
| addresses         | id, user_id, lat, lng, pincode, hub_id, is_default                                                  | Geocode on save. hub_id set by pincode lookup.                    |
| products          | id, sku, name, category, price, sub_price, is_active                                                | sub_price < price. Drives subscription toggle.                    |
| inventory_batches | id, product_id, qty, received_at, expires_at, location_id, status, qc_status                        | FEFO: ORDER BY expires_at ASC on every pick. Non-negotiable.      |
| orders            | id, user_id, subscription_id, status, type, total, placed_at                                        | type: one_time \| subscription_renewal. Status is FSM enum.       |
| subscriptions     | id, user_id, product_id, qty, frequency, status, next_billing_at, next_delivery_at, razorpay_sub_id | status enum: pending/active/paused/renewal_due/dunning/cancelled. |
| ledger_entries    | id, user_id, type, amount, ref_id, ref_type, created_at                                             | Append-only. NEVER UPDATE. Balance = SUM(amount) per user.        |
| delivery_slots    | id, hub_id, date, pincode, capacity, booked_count                                                   | booked_count increments on order. Block when = capacity.          |
| farm_batches      | id, farm_id, product_id, qty_collected, collected_at, qc_status, inventory_batch_id                 | Links farm supply to warehouse batch for full traceability.       |
| webhook_events    | id, provider, event_id, event_type, payload, processed_at                                           | Idempotency key: (provider, event_id) must be unique.             |
| hubs              | id, name, city, pincodes\[\], lat, lng, capacity                                                    | Array of serviceable pincodes. Used for order routing.            |

## **6.3 Subscription State Machine**

Every transition is triggered by exactly one source: a BullMQ job or a user action. No ad-hoc status updates in controllers. The webhooks module receives Razorpay events and calls the subscription service's transition methods.

| **From**    | **To**      | **Trigger**                              | **Side Effects**                                             |
| ----------- | ----------- | ---------------------------------------- | ------------------------------------------------------------ |
| pending     | active      | Razorpay subscription.activated webhook  | Create first delivery order. Send welcome WhatsApp.          |
| active      | renewal_due | BullMQ job fires on next_billing_at      | Charge via Razorpay. If success → active. If fail → dunning. |
| renewal_due | active      | Razorpay payment.captured webhook        | Create next delivery order. Update next_billing_at.          |
| renewal_due | dunning     | Razorpay payment.failed webhook          | Log attempt 1. Schedule retry in 24h via BullMQ.             |
| dunning     | active      | Razorpay payment.captured (retry)        | Resume delivery. Send recovery WhatsApp.                     |
| dunning     | cancelled   | BullMQ dunning job (attempt 3 exhausted) | Cancel sub. Send final email + reactivation link.            |
| active      | paused      | User action (dashboard)                  | Set pause_until date. Suspend BullMQ billing job.            |
| paused      | active      | User resumes OR pause_until date passed  | Re-queue BullMQ billing job. Send resume confirmation.       |
| active      | cancelled   | User cancels (after save flow)           | Cancel Razorpay sub. Log cancellation reason.                |

## **6.4 Razorpay Webhook Event Catalogue**

CRITICAL: Every webhook handler must check webhook_events table for (provider=razorpay, event_id). If processed_at is not null, return 200 immediately and do nothing. Razorpay retries webhooks multiple times.

| **Razorpay Event**          | **Handler Action**                                                 | **Module**      |
| --------------------------- | ------------------------------------------------------------------ | --------------- |
| subscription.activated      | Transition sub: pending → active. Create first order.              | subscriptions   |
| subscription.charged        | Transition sub: renewal_due → active. Create renewal order.        | subscriptions   |
| subscription.payment_failed | Transition sub: renewal_due → dunning. Queue dunning job.          | subscriptions   |
| subscription.cancelled      | Transition sub: → cancelled. Log reason.                           | subscriptions   |
| subscription.paused         | Transition sub: → paused (if Razorpay-initiated).                  | subscriptions   |
| payment.captured            | Mark order as paid. Trigger fulfillment queue.                     | orders          |
| payment.failed              | Mark order as payment_failed. Notify user.                         | orders          |
| refund.created              | Mark order as refunded. Credit ledger if loyalty points were used. | orders + ledger |
| order.paid                  | One-time order confirmation. Trigger pick list generation.         | orders          |

# **7\. Inventory & Supply Chain**

## **7.1 The FEFO Rule**

FEFO = First Expired, First Out. Not FIFO. An egg batch expiring Friday must ship before one expiring Sunday, regardless of which arrived first. Every pick query must ORDER BY expires_at ASC. This is non-negotiable - getting it wrong means near-expiry eggs reach customers.

## **7.2 Daily Supply Chain Flow**

- **05:00 - Farm dispatch: agent loads trays onto temperature-logged van.**
- 07:00 - Warehouse GRN: batch weighed, counted, system entry with expiry date calculated.
- 07:30 - QC check: float test, candling, visual. Batch status set to pass or quarantine.
- 08:00 - Putaway: passed batches assigned bin location. Failed batches quarantined.
- 08:30 - Pick list generation: BullMQ generates FEFO-sorted pick lists for today's orders.
- 09:00 - Packing: operator scans batch barcode, packs per order, label printed (batch ID + expiry + QR).
- 10:00 - Dispatch: manifest handed to Shadowfax. Tracking ID logged per order.
- 10:00-14:00 - Delivery window: OTP confirmation or photo POD by agent.
- 18:00 - Reconciliation: day-end system stock vs physical count. Wastage logged.

## **7.3 QC Checklist per Batch**

| **Check**         | **Method**                        | **Pass Criteria**                      | **On Fail**                                   |
| ----------------- | --------------------------------- | -------------------------------------- | --------------------------------------------- |
| Float test        | Water bucket sample (5% of batch) | Egg sinks horizontally                 | Quarantine batch. Raise supplier dispute.     |
| Visual inspection | Manual scan all trays             | No cracks, clean shell, no odour       | Reject affected trays. Log count.             |
| Weight grading    | Digital scale                     | S:&lt;53g M:53-63g L:63-73g XL:&gt;73g | Re-label to correct SKU grade.                |
| Temperature log   | Van thermometer reading           | < 20°C on arrival                      | Cold chain breach. Hold batch pending review. |
| Expiry check      | Collection date + shelf life rule | Min 10 days shelf life from today      | Flag short-dated. Priority dispatch today.    |

## **7.4 Shipping Partners**

| **Partner**            | **Use Case**                     | **When**                                |
| ---------------------- | -------------------------------- | --------------------------------------- |
| Shadowfax Hyperlocal   | Primary same-day city delivery   | Year 1 - all D2C orders                 |
| Delhivery              | Backup + long-distance           | Corporate gifts, out-of-city one-offs   |
| Own fleet (bikes/vans) | Intra-city subscription delivery | Year 2 when > 500 orders/day per city   |
| Shiprocket             | Non-perishable accessories only  | Merch, packaging gifts - never for eggs |

# **8\. Ops Admin Dashboard**

Separate internal Next.js app at admin.yourdomain.com. Ops team members should never touch the customer storefront to do their job. Every daily operation has a view here.

## **8.1 Dashboard Views**

| **View**               | **What it shows**                                                              | **User**         |
| ---------------------- | ------------------------------------------------------------------------------ | ---------------- |
| Today's orders         | Pending / packed / dispatched / delivered counts. Exception queue.             | Ops manager      |
| Pick list              | FEFO-sorted pick list per order with bin location + batch + expiry. Printable. | Warehouse staff  |
| Dispatch manifest      | Route-wise manifest per courier with customer address + slot.                  | Dispatch lead    |
| Inventory status       | Live stock per SKU, days of cover remaining, expiry alert (< 3 days).          | Procurement      |
| Subscription overrides | Pause, extend, modify any subscription with reason log.                        | Customer support |
| QC log                 | Today's batch intake, QC results, quarantined batches.                         | QC officer       |
| Failed deliveries      | Undelivered orders needing re-attempt or refund trigger.                       | Ops manager      |
| Wastage log            | Units written off today. Running monthly wastage %.                            | Ops manager      |

## **8.2 Customer Support Protocol**

SLA for a perishables brand: acknowledge in 30 minutes, resolve in 4 hours. Broken eggs or missed deliveries are brand-critical failures, not routine support tickets.

- Tool: Freshdesk. WhatsApp bot via Interakt for self-serve (order status, ETA, pause).
- Complaint resolution standards:
  - Broken / cracked eggs → replacement order same day (not refund)
  - Missed delivery → reschedule next day + 10% wallet credit
  - Wrong quantity → credit note + ops alert to packing station
  - Billing issue → ops override via admin dashboard
- Every quality complaint must be linked to the batch ID in the QC log for farm accountability.

# **9\. Subscription UX Design**

## **9.1 Subscription Toggle**

The toggle is the most important UI element in the product. Subscription is the pre-selected default on every product page. The savings amount is shown immediately. One-time is available but visually secondary.

| **Option**          | **Visual**                              | **Price shown**                                                        |
| ------------------- | --------------------------------------- | ---------------------------------------------------------------------- |
| Subscribe (default) | Selected, teal border, 'Save 10%' badge | Discounted price + frequency selector (weekly / fortnightly / monthly) |
| One-time            | Unselected, plain                       | Full price - no badge                                                  |

## **9.2 Self-Service Features (No Support Contact Required)**

If a subscriber has to WhatsApp or call to do any of the following, it is a product failure. Build every one of these before launch.

- Pause subscription (choose 1-4 week duration)
- Skip next delivery
- Change delivery frequency
- Change quantity (e.g. 6 eggs to 12 eggs)
- Change delivery address
- Swap product variant (Regular to Brown eggs)
- Cancel with save flow: show value summary → offer pause → confirm cancel

## **9.3 Dunning Sequence**

| **Attempt** | **When**            | **Channel**              | **Message**                                                     |
| ----------- | ------------------- | ------------------------ | --------------------------------------------------------------- |
| Attempt 1   | Day 0 (billing day) | Auto-charge via Razorpay | -                                                               |
| Retry 1     | Day 1               | WhatsApp + email         | Payment failed. Tap here to update your payment method.         |
| Retry 2     | Day 3               | WhatsApp + push          | Your delivery is on hold. Renew now to continue receiving eggs. |
| Retry 3     | Day 7               | WhatsApp + email         | Final notice. Subscription will be cancelled tomorrow.          |
| Auto-cancel | Day 8               | System action            | Sub cancelled. Reactivation link sent in email.                 |

# **10\. Loyalty & Rewards Engine**

## **10.1 Ledger Architecture**

The rewards balance is NEVER stored as a mutable number on the user row. Every point event is an immutable append to ledger_entries. Current balance = SELECT SUM(amount) FROM ledger_entries WHERE user_id = ?. This gives you dispute resolution and audit trails for free.

| **Event Type**                              | **Points**           | **Notes**                                |
| ------------------------------------------- | -------------------- | ---------------------------------------- |
| Subscription order placed                   | +10 per Rs 100 spent | Core earning mechanism                   |
| One-time order placed                       | +5 per Rs 100 spent  | Lower rate - incentivises subscription   |
| Referral: referred user's first order       | +200                 | Credited on order completion, not signup |
| Referral: referred user subscribes + renews | +500 bonus           | Additional on first renewal              |
| Milestone: 3 months active                  | +300                 | Retention reward                         |
| Milestone: 6 months active                  | +600                 |                                          |
| Redemption at checkout                      | \-N                  | Min 100 points = Rs 10                   |
| Expiry (12 months inactive)                 | \-N (expiry)         | Warn 30 days before via WhatsApp         |

## **10.2 Referral System**

- Every user gets a unique referral code on signup (auto-generated, URL-safe).
- Referred user gets Rs 50 off their first order.
- Referrer earns 200 points when referred user completes first order.
- Referrer earns 500 bonus points when referred user completes first subscription renewal.
- Track in referrals table: referrer_id, referred_id, status, first_order_at, first_renewal_at, rewarded_at.

# **11\. Finance & Compliance**

## **11.1 GST Framework**

| **Item**                      | **GST Rate** | **Notes**                                             |
| ----------------------------- | ------------ | ----------------------------------------------------- |
| Eggs (shell eggs)             | 0% (exempt)  | Under GST exemption list for fresh produce            |
| Delivery charges              | 18%          | Charged on delivery fee component if shown separately |
| Branded packaging             | 12-18%       | Consult CA. May form composite supply with eggs.      |
| Membership / subscription fee | 18%          | Service component. Separate from product supply.      |

Mandatory: consult a CA before the first sale. GST classification on composite supply (eggs + delivery + packaging) has nuance. Zoho Books handles GST return generation and Razorpay reconciliation automatically.

## **11.2 Finance Operations**

- Tool: Zoho Books integrated with Razorpay for auto-reconciliation.
- Razorpay settles on T+2. Reconcile daily against order IDs in Zoho.
- Subscription revenue: recognise on delivery date, not billing date.
- Monthly P&L: GMV → refunds → net revenue → COGS → gross margin → contribution margin per SKU.
- Accounts payable: farmer payments weekly, courier payments per settlement cycle.

# **12\. Analytics & Key Metrics**

## **12.1 Tools**

- PostHog: product funnels, session recording, feature flags, cohort analysis. 1M events/mo free.
- Metabase (self-hosted on Railway): ops BI connected to Postgres read replica. Free.
- Zoho Books: financial reporting and GST filing.
- Google Analytics 4: traffic acquisition and SEO attribution.

## **12.2 Weekly Review Metrics**

| **Metric**              | **Formula**                                  | **Target**     |
| ----------------------- | -------------------------------------------- | -------------- |
| MRR                     | SUM of active subscription monthly values    | Track growth % |
| Net MRR churn           | (Churned MRR - Expansion MRR) / Prior MRR    | < 5%           |
| Subscriber churn rate   | Cancelled subs / Active subs at period start | < 8% monthly   |
| Subscription pause rate | Paused this week / Active subs               | Alert if > 15% |
| On-time delivery %      | Delivered by slot time / Total dispatched    | \> 95%         |
| Complaint rate          | Support tickets / Orders delivered           | < 2%           |
| Inventory wastage %     | Units written off / Units received           | < 3%           |
| CAC by channel          | Spend / New subscribers acquired             | < Rs 300       |
| LTV:CAC ratio           | 12-month LTV / CAC                           | \> 5x          |
| FEFO compliance         | Out-of-order dispatches / Total dispatched   | 0%             |

# **13\. Execution Roadmap**

## **Phase 1 - Core Commerce (Weeks 1-6)**

Definition of Done: A real customer places an order, payment is captured by Razorpay, confirmation sent via WhatsApp and email, and the ops team sees the order in the admin dashboard pick list.

| **Week** | **Deliverable**                                                                                                                                                                                      |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1        | Turborepo monorepo setup. pnpm workspaces. GitHub repo + CI pipeline skeleton. Docker compose for local Postgres + Redis. Prisma schema: users, products, orders, inventory_batches, webhook_events. |
| 2        | Product catalog API (NestJS catalog module). Storefront product pages (Next.js). Image upload to Cloudflare R2. Clerk auth integrated.                                                               |
| 3        | Cart + checkout flow. Razorpay one-time payment. Order creation on payment.captured webhook. Idempotency on webhook handler from Day 1.                                                              |
| 4        | WhatsApp notifications via Interakt (order confirmed, dispatched). Email via Resend + React Email templates. Notification module in NestJS + BullMQ queue.                                           |
| 5        | Ops admin dashboard v1: order list, pack action, dispatch action, manifest PDF download. Freshdesk account + WhatsApp bot setup.                                                                     |
| 6        | Inventory batch management (GRN entry, FEFO pick list generation). QC log module. Zoho Books account + Razorpay sync. Day-end reconciliation flow.                                                   |

## **Phase 2 - Subscription Engine (Weeks 7-12)**

Definition of Done: A subscriber's order auto-generates on renewal date, payment auto-charges via Razorpay, and a failed payment triggers the full dunning sequence - all without human intervention.

| **Week** | **Deliverable**                                                                                                                                            |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 7        | Razorpay Subscriptions API integration. Subscription creation flow (UPI autopay + card mandate). Product page subscription toggle UI with savings display. |
| 8        | Subscription FSM in PostgreSQL. BullMQ job: fires on next_billing_at. Renewal order generation. All 9 FSM state transitions implemented.                   |
| 9        | Dunning sequence: 3 retries over 7 days. WhatsApp message per attempt. Auto-cancel on day 8. BullMQ retry scheduling.                                      |
| 10       | User subscription dashboard: view active subs, pause, skip, modify quantity, cancel with save flow. All self-serve - no support contact needed.            |
| 11       | Delivery slot management: slot capacity table, slot selection UI, booked_count increment on order. Ops dashboard: slot capacity view.                      |
| 12       | Subscription QA: end-to-end test all 9 FSM transitions. Webhook idempotency stress test. Load test renewal job with 500 concurrent subscriptions.          |

## **Phase 3 - Loyalty & Retention (Weeks 13-20)**

Definition of Done: Churn rate is measurable per acquisition cohort and LTV per channel is visible in Metabase.

| **Week** | **Deliverable**                                                                                                                               |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 13-14    | Rewards ledger: append-only ledger_entries. Earn on every order. Milestone events (3-month, 6-month streaks). Balance view in user dashboard. |
| 15       | Redemption at checkout: apply points, minimum threshold, UI affordance. Expiry logic and 30-day warning WhatsApp.                             |
| 16       | Referral system: unique codes, referrals table, point reward on order completion + subscription renewal.                                      |
| 17-18    | Sanity CMS setup: farm profile pages, batch traceability QR pages, SEO blog. QR code generation on packing labels.                            |
| 19       | Metabase BI: MRR dashboard, churn by cohort, LTV:CAC, wastage %, FEFO compliance. Postgres read replica for Metabase.                         |
| 20       | PostHog funnels: signup → first order → subscription → 3-month retained. Feature flag system for A/B testing subscription page.               |

## **Phase 4 - Scale (Month 6+)**

- Marketplace integrations: Blinkit, Swiggy Instamart catalog sync. Unicommerce adapter or custom per-platform adapter.
- Delivery agent PWA: route sheet, OTP confirmation, photo POD, COD reconciliation.
- Dark store / hub management: hub inventory allocation, pincode-to-hub routing, inter-hub transfer.
- Dairy product expansion: new SKUs, supplier onboarding, updated BOM, different shelf-life rules.
- Multi-city playbook: new hub setup, pincode import, Shadowfax city activation - target < 2 days per city.
- AI inventory forecasting: linear regression on cohort churn + reorder rates. Only after 6 months of data.

# **14\. Hosting & Tool Cost Breakdown**

The tool list looks intimidating but most items are free-tier until you have meaningful scale. The minimum viable monthly fixed cost (excluding Razorpay % on GMV) is Rs 7,000-10,000/month. Everything else unlocks only when revenue justifies it.

## **14.1 Infrastructure (Always-On)**

| **Service**                           | **Free Tier**       | **Paid (Year 1)**             | **Notes**                                                                  |
| ------------------------------------- | ------------------- | ----------------------------- | -------------------------------------------------------------------------- |
| Railway (NestJS + PostgreSQL + Redis) | Rs 500 credit/mo    | Rs 2,500-5,000/mo             | One bill covers backend, DB, and Redis. Scale-to-zero on dev environments. |
| Vercel (Next.js storefront)           | Hobby plan          | Rs 0 (Hobby) / Rs 1,700 (Pro) | Hobby is enough until you need team access or advanced analytics.          |
| Vercel (admin dashboard)              | Hobby plan          | Rs 0                          | Same Vercel account, separate project. Free.                               |
| Cloudflare R2 (assets)                | 10GB + 10M reads/mo | Rs 0-400/mo                   | Zero egress fees. Covers all product + farm images in Year 1.              |
| Cloudflare (CDN + DNS + DDoS)         | Generous free tier  | Rs 0                          | Free plan handles Year 1. No paid plan needed.                             |
| Upstash Redis (BullMQ)                | 10k commands/day    | Rs 0-800/mo                   | Pay-per-use. Very cheap at < 500 orders/day.                               |

## **14.2 Auth, Payments & Communication**

| **Service**         | **Free Tier**   | **Paid (Year 1)**  | **Notes**                                                                        |
| ------------------- | --------------- | ------------------ | -------------------------------------------------------------------------------- |
| Clerk (auth)        | 10,000 MAU free | Rs 0 (Year 1)      | 10k MAU = 10k registered users. Won't hit this in Year 1.                        |
| Razorpay (payments) | No monthly fee  | 2% per transaction | On Rs 10L GMV = Rs 20,000 fees. Baked into COGS.                                 |
| Resend (email)      | 3,000 emails/mo | Rs 0-700/mo        | 3k/mo covers ~500 orders. Scale to paid at 2,000+ orders/mo.                     |
| Interakt (WhatsApp) | No free tier    | Rs 2,499-5,999/mo  | The one unavoidable cost. WhatsApp is essential in India. Start on Starter plan. |

## **14.3 Operations, Analytics & Support**

| **Service**         | **Free Tier**           | **Paid (Year 1)**   | **Notes**                                                           |
| ------------------- | ----------------------- | ------------------- | ------------------------------------------------------------------- |
| Freshdesk (support) | Free (2 agents)         | Rs 0-2,100/agent/mo | Free plan handles Year 1. Upgrade when you hire dedicated support.  |
| Sanity.io (CMS)     | Free (3 users, 10GB)    | Rs 0                | Free tier is generous. No paid plan needed in Year 1.               |
| Zoho Books (GST)    | No free tier            | Rs 500-1,000/mo     | Non-negotiable for GST compliance. Worth every rupee.               |
| PostHog (analytics) | 1M events/mo free       | Rs 0                | 1M events is enormous. Free for all of Year 1 and likely Year 2.    |
| Metabase (BI)       | Open source self-hosted | Rs 0                | Self-host on Railway. Connects to Postgres read replica. Zero cost. |
| Sentry (errors)     | 5k errors/mo free       | Rs 0-1,500/mo       | Free tier covers Year 1.                                            |

## **14.4 Development Tools**

| **Service**              | **Free Tier**            | **Paid**    | **Notes**                                                     |
| ------------------------ | ------------------------ | ----------- | ------------------------------------------------------------- |
| GitHub (repos + Actions) | 2,000 CI minutes/mo free | Rs 0        | Free for solo developer.                                      |
| Cursor (AI IDE)          | Limited free             | Rs 1,700/mo | Highly recommended. Pays for itself in velocity.              |
| 1Password (secrets)      | No free tier             | Rs 300/mo   | Store all .env credentials securely. Non-negotiable practice. |

|     | **Conservative total (Year 1, fixed costs only)** | **Rs 8,000-14,000/month** |
| --- | ------------------------------------------------- | ------------------------- |
|     | Minimum viable (Railway + Interakt + Zoho only)   | Rs 5,500-8,500/month      |
|     | Razorpay fees (variable, on GMV)                  | 2% of monthly GMV         |
|     | Shadowfax shipping (variable, per order)          | Rs 45-65 per order        |

# **15\. AI Acceleration Strategy**

## **15.1 Use AI Aggressively For**

| **Task**                   | **Tool**        | **How**                                                                          |
| -------------------------- | --------------- | -------------------------------------------------------------------------------- |
| CRUD endpoint generation   | Cursor + Claude | Paste Prisma schema, ask for full NestJS module with controller + service + DTO. |
| DB migration scripts       | Cursor          | Describe schema change in English, generate Prisma migration.                    |
| React Email templates      | Claude          | Describe the email event, get a React Email template with brand colours.         |
| Edge case test generation  | Claude          | Paste subscription FSM, ask for Jest test scenarios for all 9 transitions.       |
| Admin UI components        | Cursor + v0.dev | Generate data table + filter components for ops dashboard.                       |
| Architecture documentation | Claude          | Paste new module code, ask to update the ARCHITECTURE.md section.                |
| SQL query optimisation     | Claude          | Paste slow query + EXPLAIN ANALYZE output, ask for optimised version.            |
| .cursorrules file          | Claude          | Ask Claude to generate a .cursorrules file from your stack and conventions.      |

## **15.2 Never Let AI Write These (Do It Yourself)**

These four systems are where subtle bugs cost real money or destroy customer trust. Write them yourself, slowly, with explicit unit tests for every state transition.

- Subscription FSM transition logic - a wrong transition = double billing or missed renewal.
- Rewards ledger append logic - any mutation to balances breaks the audit trail permanently.
- Razorpay webhook idempotency - AI consistently misses edge cases here.
- FEFO pick list query - wrong sort order = near-expiry eggs shipped to customers.

# **16\. Technical Debt Traps - First 90 Days**

| **Trap**                     | **Symptom if you fall in**                       | **Prevention**                                                                    |
| ---------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------- |
| Custom subscription billing  | Building renewal + mandate logic from scratch    | Use Razorpay Subscriptions API. Handles UPI autopay + RBI pre-debit notification. |
| Mutable rewards balance      | UPDATE users SET points = points + N             | Append-only ledger_entries. Balance = SUM. No exceptions, ever.                   |
| Webhook idempotency skipped  | Duplicate order fulfillment on Razorpay retry    | Check (provider, event_id) in webhook_events before processing.                   |
| Slot UI before ops readiness | Promising delivery windows you cannot fulfill    | Show static copy until logistics can honor dynamic slots.                         |
| Premature microservices      | 6 services for 50 orders/day                     | NestJS monolith first. Extract when a module genuinely needs different scaling.   |
| FIFO instead of FEFO         | Near-expiry eggs shipped to customers            | ORDER BY expires_at ASC on every pick query. Add a DB constraint or test.         |
| Building CMS + support + GST | 3 months lost on non-moat infrastructure         | Buy: Sanity, Freshdesk, Zoho. Build: subscription FSM, inventory, ledger.         |
| No Postgres read replica     | Metabase analytics queries killing production DB | Set up Railway read replica before connecting Metabase to any database.           |
| TypeORM instead of Prisma    | Losing type safety between DB and API layer      | Prisma's generated client types propagate through the entire NestJS app.          |
| No .cursorrules file         | AI generates code that violates your conventions | Add .cursorrules at root on Day 1. Update it every week.                          |

# **17\. Growth Strategy**

Pick ONE channel in Phase 1. Go deep. Get 100 loyal subscribers. Then expand. Spreading across SEO + Instagram + YouTube + influencers simultaneously at zero budget = slow death. For Bengaluru-based food: Instagram + local micro-influencers is the correct first bet.

## **17.1 Channel Plan**

| **Channel**         | **Phase** | **Tactic**                                                           | **Metric**                          |
| ------------------- | --------- | -------------------------------------------------------------------- | ----------------------------------- |
| Instagram organic   | 1         | Farm visit reels, QR trace demos, subscriber unboxing. 3 posts/week. | Follower growth + save rate         |
| Micro-influencers   | 1         | 10k-100k Bengaluru food/health creators. Track CAC per influencer.   | CAC per acquired subscriber         |
| WhatsApp community  | 1         | Weekly farm update + QC transparency report to subscriber group.     | Community size + open rate          |
| SEO content         | 2         | Traceability blog + city-level landing pages via Sanity CMS.         | Organic sessions + sub conversions  |
| Referral programme  | 2         | Built into loyalty engine. Dual-sided reward.                        | Referral conversion rate            |
| YouTube long-form   | 3         | Farm-to-door documentary style. High trust signal.                   | Watch time + brand search volume    |
| Blinkit / Instamart | 4         | Volume channel. Low margin. Brand awareness.                         | Channel GMV % (cap at 30% of total) |

## **17.2 Content Pillars**

- Protein education: daily egg requirements, complete protein science, meal ideas.
- Farm transparency: monthly farm visit content. Name the farmer. Show the conditions.
- Subscription value: cost per egg on subscription vs local market vs supermarket.
- Traceability: scan this QR code and see exactly which farm your eggs came from.

# **18\. Decision Log**

Record every major architectural or business decision here. This prevents re-litigating settled decisions and onboards future team members instantly. Add a row every time a significant choice is made.

| **Date** | **Decision**                              | **Rationale**                                                                                  | **Alternatives Rejected**                                                        |
| -------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Mar 2026 | Custom platform over Shopify              | Need owned subscription lifecycle + rewards engine.                                            | Shopify Rs 1L-3L/yr + app lock-in. Dukaan too rigid.                             |
| Mar 2026 | NestJS over Fastify                       | Familiar structure, DI container, Jest built-in, easier hiring. No cost difference on Railway. | Fastify: faster raw but less structure. Wrong trade-off for 20+ module codebase. |
| Mar 2026 | Turborepo + pnpm monorepo                 | One repo for web + api + admin + shared packages. Turbo cache speeds CI.                       | Nx: more complex. Separate repos: no shared types, painful.                      |
| Mar 2026 | Razorpay Subscriptions API                | UPI autopay mandate + RBI pre-debit notification handled natively.                             | Custom billing: high compliance risk and 6+ weeks of build.                      |
| Mar 2026 | FEFO over FIFO                            | Expiry date is the correct sort key for perishables.                                           | FIFO: leads to near-expiry dispatch. Unacceptable.                               |
| Mar 2026 | Shadowfax Hyperlocal over Shiprocket      | Same-day SLA. Shiprocket built for non-perishables.                                            | Shiprocket: fine for T-shirt brands. Wrong for eggs.                             |
| Mar 2026 | Append-only rewards ledger                | Immutable audit trail. Balance from SUM query. Dispute resolution built-in.                    | Mutable balance: no history, impossible to audit.                                |
| Mar 2026 | Buy: Freshdesk, Sanity, Zoho Books, Clerk | None are our moat. Build time = 3+ months of wasted engineering.                               | Custom build: misallocated effort on commodity problems.                         |
| Mar 2026 | Prisma over TypeORM                       | End-to-end type safety from schema to API response. TypeORM requires manual DTO mapping.       | TypeORM: valid but more boilerplate.                                             |

# **19\. Appendix**

## **A. Build vs Buy Final Summary**

| **Module**               | **Decision**  | **Tool / Approach**                                 |
| ------------------------ | ------------- | --------------------------------------------------- |
| Subscription FSM         | BUILD         | NestJS subscriptions module + BullMQ + PostgreSQL   |
| Inventory (FEFO)         | BUILD         | Custom PostgreSQL queries - ORDER BY expires_at ASC |
| Rewards ledger           | BUILD         | Append-only ledger_entries in PostgreSQL            |
| Ops admin dashboard      | BUILD         | Internal Next.js app - separate Vercel project      |
| Farm traceability pages  | BUILD         | Sanity CMS content - generated from batch data      |
| Customer support         | BUY           | Freshdesk (tickets + WhatsApp bot via Interakt)     |
| CMS / blog               | BUY           | Sanity.io - headless, free tier                     |
| GST / invoicing          | BUY           | Zoho Books - Rs 500/mo                              |
| Email                    | BUY           | Resend + React Email                                |
| WhatsApp notifications   | BUY           | Interakt                                            |
| Auth                     | BUY           | Clerk                                               |
| Payments + subscriptions | BUY           | Razorpay Subscriptions API                          |
| Marketplace sync         | BUY (Phase 4) | Unicommerce or custom adapter per platform          |
| BI dashboards            | BUY (free)    | Metabase self-hosted on Railway                     |
| Product analytics        | BUY (free)    | PostHog - 1M events/mo free                         |

## **B. Glossary**

| **Term**         | **Definition**                                                                                  |
| ---------------- | ----------------------------------------------------------------------------------------------- |
| FSM              | Finite State Machine. Subscription status is a strict enum with defined transitions only.       |
| FEFO             | First Expired, First Out. Dispatch soonest-expiring batch first. Critical for perishables.      |
| GRN              | Goods Receipt Note. Formal record of batch received from farm at warehouse.                     |
| BOM              | Bill of Materials. Components to pack one unit (e.g. 6 eggs + 1 pulp tray + 1 carton).          |
| Dunning          | Automated retry sequence for failed subscription payments over 7 days.                          |
| MRR              | Monthly Recurring Revenue. Sum of all active subscription monthly values.                       |
| LTV              | Lifetime Value. Total revenue expected from a subscriber over their active lifetime.            |
| CAC              | Customer Acquisition Cost. Total marketing spend / new subscribers acquired.                    |
| POD              | Proof of Delivery. OTP confirmation or photo taken by delivery agent at customer door.          |
| Idempotency      | A webhook handler that produces the same result whether called once or ten times.               |
| Dark store       | A small fulfilment hub for delivery only. No customer walk-ins.                                 |
| Cold chain       | Temperature-controlled supply chain from farm to customer door. < 20°C throughout.              |
| Composite supply | GST term for a bundle of goods and services (eggs + delivery + packaging).                      |
| Read replica     | A read-only copy of the Postgres DB. Used for Metabase analytics to avoid impacting production. |
| Turborepo cache  | Turborepo stores build outputs. Unchanged packages skip rebuild in CI, saving minutes.          |

**This is a living document.**

Update it when decisions change. Add to the decision log on every major call.

Version 2.0 - March 2026 - Modern Essentials

### Missing pieces

- DAILY subscriptions
- Integrating zepto, instamart, blinkit and other partners for distribution

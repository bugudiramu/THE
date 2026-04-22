# GEMINI.md - Modern Essentials Project Context

## Project Overview
**Modern Essentials** is a subscription-first D2C fresh essentials brand built with a focus on radical transparency and honest marketing. The project is a **Turborepo monorepo** using **PNPM**.

### Tech Stack
- **Frontend:** Next.js 14, Tailwind CSS, shadcn/ui, Clerk (Auth)
- **Backend:** NestJS, Prisma (ORM), BullMQ (Scheduling), PostgreSQL, Redis
- **Infrastructure:** Turborepo, PNPM, Docker, AWS S3, Sanity.io (CMS)

## Directory Structure & Local Context
Each major directory contains its own `GEMINI.md` with localized context.

- `apps/web`: [Web Storefront](./apps/web/GEMINI.md) - Customer-facing Next.js app.
- `apps/admin`: [Admin Dashboard](./apps/admin/GEMINI.md) - Internal operations and fulfillment.
- `apps/api`: [API Service](./apps/api/GEMINI.md) - Central NestJS backend.
- `packages/db`: [Database Layer](./packages/db/GEMINI.md) - Prisma schema and client.
- `packages/types`: [Shared Types](./packages/types/GEMINI.md) - Common TypeScript definitions.
- `packages/utils`: [Shared Utilities](./packages/utils/GEMINI.md) - Helper functions.
- `packages/email`: [Transactional Emails](./packages/email/GEMINI.md) - React-based templates.
- `packages/ui`: [Shared UI](./packages/ui/GEMINI.md) - Design system components.
- `packages/config`: [Shared Config](./packages/config/GEMINI.md) - Linter, TS, and Tailwind configs.

## Key Business Logic (The Core Mandates)
- **Subscription-First:** Primary purchase mode is recurring subscriptions.
- **FEFO Law:** "First Expired, First Out" logic is mandatory for perishables.
- **Radical Transparency:** Cost breakdowns and batch traceability are core.
- **Idempotency:** All webhooks (Razorpay, etc.) MUST be processed exactly once via the `webhook_events` log.
- **Immutable Ledger:** User rewards/balances are updated ONLY via appending to `ledger_entries`.
- **State Machine:** Subscription status transitions happen ONLY in `SubscriptionService`.

## Development Workflow

### Core Commands
- `pnpm dev`: Starts all applications in parallel.
- `pnpm build`: Builds all applications and packages.
- `pnpm test`: Runs the test suite across the monorepo.
- `pnpm db:migrate`: Applies Prisma migrations.
- `pnpm db:generate`: Generates the Prisma client.

### Conventions
- **TypeScript:** Strict mode everywhere. No `any`.
- **Git:** Conventional Commits are enforced.
- **NestJS:** module/controller/service/dto pattern for every module.
- **Prisma:** Always `ORDER BY expires_at ASC` when picking inventory.

## Recent Architectural Changes
- **Product Variants:** Transitioned from simple products to a Variant-based model.
- **Dunning Workflow:** Automated retry logic for failed subscription payments.
- **Inventory Reconciliation:** System for syncing physical vs system stock levels.
- **Partner Links:** Integration for Quick Commerce links (Zepto, Blinkit).

## Documentation & References
- `modern_essentials_blueprint_v2.md`: Detailed vision and roadmap.
- `ISSUES_SUMMARY.md`: Current known issues and debt.
- `TESTING_CHECKLIST.md`: Pre-deployment procedures.

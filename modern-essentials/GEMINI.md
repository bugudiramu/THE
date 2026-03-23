# GEMINI.md - Modern Essentials Project Context

## Project Overview
**Modern Essentials** is a subscription-first D2C fresh essentials brand (starting with eggs, expanding to dairy) built with a focus on radical transparency and honest marketing. The project is organized as a **Turborepo monorepo** using **PNPM** for package management.

### Tech Stack
- **Frontend (Storefront/Admin):** Next.js 14, Tailwind CSS, shadcn/ui, Clerk (Auth)
- **Backend (API):** NestJS, Prisma (ORM), BullMQ (Scheduling), PostgreSQL, Redis
- **Infrastructure:** Turborepo, PNPM, Docker (local dev), AWS S3 (storage), Sanity.io (CMS)

## Directory Structure
- `apps/web`: Customer-facing storefront (Next.js)
- `apps/admin`: Internal operations dashboard (Next.js)
- `apps/api`: Main backend service (NestJS)
- `packages/db`: Shared Prisma schema and generated client
- `packages/types`: Shared TypeScript interfaces and types
- `packages/utils`: Shared utility functions
- `packages/email`: React-based email templates

## Key Business Logic
- **Subscription-First:** The primary purchase mode is recurring subscriptions.
- **FEFO Inventory:** "First Expired, First Out" logic is mandatory for perishables.
- **Radical Transparency:** Cost breakdowns and batch traceability are core features.
- **Idempotent Webhooks:** All incoming webhooks (Razorpay, etc.) are logged and processed exactly once.

## Development Workflow

### Core Commands
- `pnpm dev`: Starts all applications in parallel.
- `pnpm build`: Builds all applications and packages.
- `pnpm test`: Runs the test suite across the monorepo.
- `pnpm lint`: Lints the codebase using ESLint.
- `pnpm db:migrate`: Applies Prisma migrations to the database.
- `pnpm db:generate`: Generates the Prisma client (run this after schema changes).
- `pnpm db:studio`: Opens Prisma Studio for manual data inspection.

### Conventions
- **Database Changes:** Always modify `packages/db/schema.prisma` and run `pnpm db:migrate`.
- **API Documentation:** The NestJS API provides Swagger documentation at `/api/docs`.
- **Shared Types:** Add cross-service types to `packages/types/src/index.ts`.
- **Environment Variables:** All environment variables must exist in `.env.example` with a description comment.
- **Git:** Conventional Commits are enforced via husky and commitlint.
- **TypeScript:** Strict mode everywhere. No `any`. No type assertions without comment.
- **NestJS:** Every module gets: `module.ts`, `controller.ts`, `service.ts`, `dto.ts`. No `console.log` in committed code (use NestJS Logger).
- **Prisma & FEFO:** Every Prisma query that picks inventory MUST `ORDER BY expires_at ASC` (FEFO law).
- **Webhooks:** Every Razorpay webhook handler MUST check `webhook_events` table for idempotency first.
- **Ledger:** Rewards balance is NEVER updated directly. Append to `ledger_entries` only.
- **State Machines:** Subscription status transitions happen ONLY in the subscription service, never in controllers.
- **Package Manager:** Use `pnpm` ONLY.

## Documentation & References
- `modern_essentials_blueprint_v2.md`: Detailed company vision, technical roadmap, and module map.
- `CLERK_SETUP_INSTRUCTIONS.md`: Setup guide for authentication.
- `ISSUES_SUMMARY.md`: Current known issues and technical debt.
- `TESTING_CHECKLIST.md`: Pre-deployment testing procedures.

# Week 1: Turborepo Monorepo Setup & Foundation

> **Blueprint Ref:** §4.1 (Chosen Stack), §5.1 (Repository Structure), §5.2 (NestJS Module Structure), §5.3 (Development Toolchain), §5.4 (Local Development Setup), §5.5 (Environment Variables), §5.6 (CI/CD Pipeline), §6.2 (Core Database Schema), §13 Phase 1 Week 1
> **Sprint Goal:** A developer can clone the repo, run `pnpm install && docker compose up -d && pnpm dev`, and see all three apps (web, api, admin) running locally with a PostgreSQL database containing the core schema.

---

## Current State (Day 0)

| Area | Status |
|---|---|
| Repository | Does not exist |
| Package manager | pnpm 9+ required |
| Database | No schema, no migrations |
| Apps | None |
| Shared packages | None |
| CI/CD | None |
| Docker | None |

---

## Objectives

1. Initialize the Turborepo + pnpm workspaces monorepo with all three apps and shared packages.
2. Set up the core Prisma schema with foundational tables (`users`, `products`, `orders`, `inventory_batches`, `webhook_events`).
3. Configure Docker Compose for local PostgreSQL + Redis.
4. Scaffold the NestJS API with module structure, Swagger, and CORS.
5. Scaffold Next.js 14 apps for storefront (`web`) and admin dashboard (`admin`).
6. Set up CI pipeline skeleton with GitHub Actions.

---

## Key Deliverables

### Deliverable 1 — Turborepo Monorepo Scaffold

| Item | Detail |
|---|---|
| Root `package.json` | Workspace root with `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm test` scripts |
| `pnpm-workspace.yaml` | Registers `apps/*` and `packages/*` as workspaces |
| `turbo.json` | Build pipeline: `lint → typecheck → test → build`. Cache outputs configured. |
| `.gitignore` | Covers `node_modules`, `.turbo`, `.next`, `dist`, `.env`, `generated/` |

### Deliverable 2 — Shared Packages

| Item | Detail |
|---|---|
| `packages/db` | Prisma schema, `prisma generate` script, exports generated client. `schema.prisma` contains Day 1 tables. |
| `packages/types` | Shared TypeScript interfaces: `User`, `Product`, `Order`, `InventoryBatch`. Exported from `src/index.ts`. |
| `packages/utils` | Shared helpers: `formatCurrency()`, `formatDate()`. Placeholder for FEFO utils. |
| `packages/config` | Shared `tsconfig.base.json`, ESLint config, Prettier config. All apps extend these. |
| `packages/email` | React Email scaffold. Placeholder templates for order confirmation and welcome email. |

### Deliverable 3 — Prisma Schema (Day 1 Tables)

Based on §6.2 Core Database Schema:

| Table | Critical Fields | Notes |
|---|---|---|
| `User` | `id`, `phone`, `email`, `clerkId`, `tier`, `createdAt` | Phone is primary login in India. `clerkId` links to Clerk. |
| `Product` | `id`, `sku`, `name`, `description`, `category`, `price`, `subPrice`, `imageUrl`, `isActive` | `subPrice < price`. Drives subscription toggle. |
| `Order` | `id`, `userId`, `subscriptionId?`, `status`, `type`, `total`, `placedAt` | `type: ONE_TIME | SUBSCRIPTION_RENEWAL`. Status is FSM enum. |
| `OrderItem` | `id`, `orderId`, `productId`, `qty`, `price`, `total` | Line items per order. |
| `InventoryBatch` | `id`, `productId`, `qty`, `receivedAt`, `expiresAt`, `locationId`, `status`, `qcStatus` | FEFO: `ORDER BY expires_at ASC` on every pick. |
| `WebhookEvent` | `id`, `provider`, `eventId`, `eventType`, `payload`, `processedAt` | `@@unique([provider, eventId])` for idempotency. |
| `Cart` | `id`, `userId` | One cart per user. |
| `CartItem` | `id`, `cartId`, `productId`, `qty` | Items in user's cart. |
| `Subscription` | `id`, `userId`, `productId`, `qty`, `frequency`, `status`, `nextBillingAt`, `nextDeliveryAt`, `razorpaySubId` | Status FSM enum. Placeholder for Week 7+. |
| `LedgerEntry` | `id`, `userId`, `type`, `amount`, `refId`, `refType`, `createdAt` | Append-only. Placeholder for Week 13+. |

**Enums:**
- `OrderStatus`: `PENDING`, `PAID`, `PICKED`, `PACKED`, `DISPATCHED`, `DELIVERED`, `CANCELLED`, `REFUNDED`
- `OrderType`: `ONE_TIME`, `SUBSCRIPTION_RENEWAL`
- `SubscriptionStatus`: `PENDING`, `ACTIVE`, `PAUSED`, `RENEWAL_DUE`, `DUNNING`, `CANCELLED`
- `SubscriptionFrequency`: `WEEKLY`, `FORTNIGHTLY`, `MONTHLY`
- `BatchStatus`: `AVAILABLE`, `RESERVED`, `DEPLETED`
- `QCStatus`: `PENDING`, `PASSED`, `QUARANTINE`, `REJECTED`

### Deliverable 4 — NestJS API Scaffold

| Item | Detail |
|---|---|
| `main.ts` | Bootstrap with Swagger at `/api/docs`, CORS for `localhost:3000` + `localhost:3001`, port 4000 |
| `app.module.ts` | Root module. Imports `PrismaModule` (global). |
| `common/prisma.service.ts` | Shared Prisma service wrapping the generated client |
| `common/prisma.module.ts` | Global module exporting `PrismaService` |
| `common/guards/clerk-auth.guard.ts` | Placeholder Clerk JWT verification guard |
| `common/decorators/current-user.decorator.ts` | `@CurrentUser()` param decorator |
| `common/filters/http-exception.filter.ts` | Global exception filter with structured error logging |

### Deliverable 5 — Next.js Apps Scaffold

| Item | Detail |
|---|---|
| `apps/web` | Next.js 14 App Router. Tailwind CSS + shadcn/ui initialized. Placeholder `page.tsx` with brand hero. |
| `apps/admin` | Next.js 14 App Router. Tailwind CSS. Placeholder `page.tsx` with "Ops Dashboard" title. Port 3001. |
| Both apps | `next.config.js` configured to transpile `@modern-essentials/types` and `@modern-essentials/utils`. |

### Deliverable 6 — Docker & Local Dev

| Item | Detail |
|---|---|
| `docker-compose.yml` | PostgreSQL 16 at `localhost:5432` + Redis 7 at `localhost:6379`. Persistent volumes. Health checks. |
| `.env.example` files | Template env files for `apps/api`, `apps/web`, `apps/admin` with descriptions per §5.5. |
| Seed script | `packages/db/seed.ts` — seeds 3-4 test products (Regular Eggs, Brown Eggs, High-Protein Eggs) + 1 test user. |

### Deliverable 7 — CI Pipeline Skeleton

| Item | Detail |
|---|---|
| `.github/workflows/ci.yml` | Triggers on push to `main` and PRs. Steps: checkout → pnpm install → lint → typecheck → test → build. Uses Turborepo cache. |
| Husky + lint-staged | Pre-commit hook: lint + format only changed files. |
| Commitlint | Enforces conventional commits (`feat:`, `fix:`, `chore:`). |

---

## Proposed Changes

### Root Configuration

---

#### [NEW] `package.json`
Root workspace definition with scripts: `dev`, `build`, `lint`, `test`, `db:migrate`, `db:generate`, `db:studio`.

#### [NEW] `pnpm-workspace.yaml`
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

#### [NEW] `turbo.json`
Build pipeline with `lint`, `typecheck`, `test`, `build` tasks. Cache configuration for `.next`, `dist`.

#### [NEW] `docker-compose.yml`
PostgreSQL 16 + Redis 7 with health checks and persistent volumes.

#### [NEW] `.github/workflows/ci.yml`
GitHub Actions CI pipeline.

#### [NEW] `commitlint.config.js`
Conventional commits config.

---

### Shared Packages

---

#### [NEW] `packages/db/schema.prisma`
Full Day 1 schema with all tables and enums listed in Deliverable 3.

#### [NEW] `packages/db/package.json`
Scripts: `generate`, `migrate`, `studio`, `seed`. Exports generated Prisma client.

#### [NEW] `packages/db/seed.ts`
Seeds test products and a test user.

#### [NEW] `packages/types/src/index.ts`
Re-exports all type files.

#### [NEW] `packages/types/src/user.ts`
`IUser` interface matching the `User` Prisma model.

#### [NEW] `packages/types/src/product.ts`
`IProduct` interface matching the `Product` Prisma model.

#### [NEW] `packages/types/src/order.ts`
`IOrder`, `IOrderItem` interfaces + status enums.

#### [NEW] `packages/utils/src/index.ts`
`formatCurrency()`, `formatDate()` helpers.

#### [NEW] `packages/config/tsconfig.base.json`
Shared TypeScript strict config. All apps extend this.

#### [NEW] `packages/config/eslint-base.js`
Shared ESLint config.

#### [NEW] `packages/config/prettier.config.js`
Shared Prettier config.

#### [NEW] `packages/email/package.json`
React Email scaffold with placeholder templates.

---

### Backend — NestJS API (`apps/api`)

---

#### [NEW] `apps/api/src/main.ts`
Bootstrap NestJS with Swagger, CORS, global exception filter. Port 4000.

#### [NEW] `apps/api/src/app.module.ts`
Root module importing `PrismaModule` (global).

#### [NEW] `apps/api/src/common/prisma.service.ts`
Wraps the generated Prisma client with `onModuleInit` lifecycle hook.

#### [NEW] `apps/api/src/common/prisma.module.ts`
Global module exporting `PrismaService`.

#### [NEW] `apps/api/src/common/guards/clerk-auth.guard.ts`
Placeholder Clerk JWT verification guard (returns `true` for now).

#### [NEW] `apps/api/src/common/decorators/current-user.decorator.ts`
`@CurrentUser()` request decorator.

#### [NEW] `apps/api/src/common/filters/http-exception.filter.ts`
Global exception filter with NestJS Logger.

#### [NEW] `apps/api/package.json`
NestJS dependencies: `@nestjs/core`, `@nestjs/common`, `@nestjs/swagger`, `@nestjs/platform-express`, `class-validator`, `class-transformer`.

---

### Frontend — Storefront (`apps/web`)

---

#### [NEW] `apps/web/src/app/layout.tsx`
Root layout with Inter font, Tailwind globals.

#### [NEW] `apps/web/src/app/page.tsx`
Placeholder hero page with brand name.

#### [NEW] `apps/web/next.config.js`
Transpile shared packages.

#### [NEW] `apps/web/tailwind.config.js`
Tailwind with shadcn/ui integration.

---

### Frontend — Admin Dashboard (`apps/admin`)

---

#### [NEW] `apps/admin/src/app/layout.tsx`
Root layout with Inter font.

#### [NEW] `apps/admin/src/app/page.tsx`
Placeholder "Ops Dashboard" page.

#### [NEW] `apps/admin/next.config.js`
Transpile shared packages. Port 3001.

---

## Dependencies to Install

| Package | Where | Why |
|---|---|---|
| `turbo` | Root (devDep) | Monorepo build orchestration |
| `typescript` 5.x | Root + all packages | TypeScript strict mode |
| `eslint` + plugins | `packages/config` | Shared linting |
| `prettier` | `packages/config` | Shared formatting |
| `husky` + `lint-staged` | Root | Pre-commit hooks |
| `commitlint` | Root | Conventional commit enforcement |
| `@nestjs/core` + ecosystem | `apps/api` | Backend framework |
| `@nestjs/swagger` | `apps/api` | Auto-generated API docs |
| `class-validator` + `class-transformer` | `apps/api` | DTO validation |
| `prisma` + `@prisma/client` | `packages/db` | ORM + migrations |
| `next` 14 | `apps/web`, `apps/admin` | Frontend framework |
| `react` + `react-dom` 18 | `apps/web`, `apps/admin` | UI library |
| `tailwindcss` + `postcss` + `autoprefixer` | `apps/web`, `apps/admin` | Styling |
| `@clerk/nextjs` | `apps/web` (admin later) | Auth (client side) |
| `@react-email/components` | `packages/email` | Email templates |

---

## Out of Scope (Week 2+)

- Product catalog API endpoints and storefront product pages → Week 2
- Image upload to Cloudflare R2 → Week 2
- Clerk auth integration (beyond placeholder guard) → Week 2
- Cart + checkout flow → Week 3
- Razorpay payment integration → Week 3
- Any notification system → Week 4
- Admin dashboard views → Week 5

---

## Verification Plan

### Automated Tests

1. **Build check** — all apps and packages compile:
   ```bash
   pnpm turbo run build
   ```

2. **Type check** — no TypeScript errors:
   ```bash
   pnpm turbo run typecheck
   ```

3. **Lint check** — passes across all workspaces:
   ```bash
   pnpm lint
   ```

### Local Development Verification

4. **Docker services start** — Postgres + Redis healthy:
   ```bash
   docker compose up -d
   docker compose ps  # both services should show "healthy"
   ```

5. **Database migration** — schema applies cleanly:
   ```bash
   cd packages/db && pnpm prisma migrate dev
   ```

6. **Seed data** — test data loads:
   ```bash
   cd packages/db && pnpm prisma db seed
   ```

7. **Prisma Studio** — visual confirmation:
   ```bash
   cd packages/db && pnpm prisma studio
   ```

### Browser Verification

8. **All three apps start** — `pnpm dev` from root:
   - `http://localhost:3000` → Storefront placeholder renders
   - `http://localhost:4000/api/docs` → Swagger UI loads
   - `http://localhost:3001` → Admin placeholder renders

### Manual Verification

9. **Workspace dependencies** — `pnpm ls --filter @modern-essentials/web` shows shared packages linked
10. **Turborepo cache** — run `pnpm build` twice, second run should hit cache (`FULL TURBO`)

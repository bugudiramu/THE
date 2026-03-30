# Week 2: Product Catalog API & Storefront

> **Blueprint Ref:** §3.1 (Customer-Facing Modules), §4.1 (Chosen Stack), §5.2 (NestJS Module Structure), §6.1 (Module Ownership — Catalog), §6.2 (Products Table), §13 Phase 1 Week 2
> **Sprint Goal:** A customer can browse a beautiful product catalog on the storefront, with real product data served from the NestJS API, images hosted on Cloudflare R2, and Clerk authentication protecting user sessions.

---

## Current State (End of Week 1)

| Area | Status |
|---|---|
| Monorepo | Turborepo + pnpm workspaces fully configured. All three apps scaffold. |
| Database | Prisma schema with core tables. Migrations applied. Seed data: 3-4 test products + 1 test user. |
| API | NestJS scaffold with Swagger at `/api/docs`. `PrismaModule` global. Placeholder Clerk guard. |
| Storefront | Next.js 14 with Tailwind + shadcn/ui. Placeholder hero page only. |
| Admin | Next.js 14 scaffold. Placeholder page only. |
| Auth | Clerk packages installed but not integrated beyond placeholder guard. |
| CI | GitHub Actions pipeline: lint → typecheck → build. |

---

## Objectives

1. Build the **NestJS catalog module** (`apps/api/src/modules/catalog/`) with full CRUD for products.
2. Implement **Clerk auth integration** on both `apps/web` (client) and `apps/api` (JWT verification guard).
3. Build the **storefront product listing page** and **product detail page** with responsive design.
4. Set up **Cloudflare R2 image upload** via the existing `aws-s3` module for product images.
5. Create beautiful, branded UI components (header, footer, product cards) matching the premium brand aesthetic.

---

## Key Deliverables

### Deliverable 1 — NestJS Catalog Module

| Endpoint | Method | Purpose |
|---|---|---|
| `GET /catalog/products` | GET | List all active products. Supports `?category=` filter. Public. |
| `GET /catalog/products/:id` | GET | Single product detail with full info. Public. |
| `POST /catalog/products` | POST | Create a product (admin only). Guarded by `ClerkAuthGuard`. |
| `PATCH /catalog/products/:id` | PATCH | Update product fields (price, description, image, active status). Admin only. |
| `DELETE /catalog/products/:id` | DELETE | Soft-delete (set `isActive = false`). Admin only. |

| Item | Detail |
|---|---|
| `catalog.module.ts` | Imports `PrismaModule`. Registers controller + service. |
| `catalog.controller.ts` | Route handlers with Swagger decorators. Public reads, guarded writes. |
| `catalog.service.ts` | Business logic. All queries filter by `isActive: true` for public endpoints. |
| `catalog.dto.ts` | `CreateProductDto`, `UpdateProductDto` with `class-validator` decorators. |

### Deliverable 2 — Clerk Authentication

| Item | Detail |
|---|---|
| `apps/web` — `ClerkProvider` | Wrap root layout with `ClerkProvider`. Add `SignInButton` / `UserButton` to header. |
| `apps/web` — `middleware.ts` | Clerk middleware protecting `/account/*`, `/checkout/*` routes. Public: `/`, `/products/*`. |
| `apps/api` — `ClerkAuthGuard` | Real JWT verification using `@clerk/backend`. Extracts `userId` from Clerk session token. |
| `apps/api` — `@CurrentUser()` | Decorator returns `{ id: string, email: string }` from verified Clerk token. |
| `.env` variables | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` for both web and API. |

### Deliverable 3 — Storefront Product Pages

| Page | Route | Detail |
|---|---|---|
| Products listing | `/products` | Grid of product cards. Each card: image, name, price, subscription price with "Save X%" badge, "Add to Cart" button. |
| Product detail | `/products/[id]` | Full product page: large image, description, nutrition info placeholder, price comparison (one-time vs subscribe), quantity selector. |

| Component | Detail |
|---|---|
| `UserHeader` | Brand logo, nav links (Shop, Our Story), cart icon with count badge, Clerk `UserButton`. |
| `Footer` | Brand info, social links, legal links. |
| `ProductCard` | Image, name, price, sub price with savings badge, hover effects. Responsive grid item. |
| `ProductDetail` | Large image, description, pricing toggle placeholder (full subscribe toggle in Week 7). |

### Deliverable 4 — Image Upload (Cloudflare R2)

| Item | Detail |
|---|---|
| `aws-s3.module.ts` | S3-compatible module configured for Cloudflare R2 endpoint. |
| `aws-s3.service.ts` | `uploadFile(file, key)`, `getSignedUrl(key)`, `deleteFile(key)`. |
| Upload endpoint | `POST /catalog/products/:id/image` — accepts multipart form data, uploads to R2, saves URL to product. |
| CDN URL | Images served via Cloudflare CDN URL stored in `Product.imageUrl`. |

---

## Proposed Changes

### Backend — NestJS API

---

#### [NEW] `apps/api/src/modules/catalog/catalog.module.ts`
NestJS module registering the catalog controller + service.

#### [NEW] `apps/api/src/modules/catalog/catalog.controller.ts`
REST controller with Swagger-decorated endpoints. Public reads, guarded writes.

#### [NEW] `apps/api/src/modules/catalog/catalog.service.ts`
Business logic: CRUD operations on `Product` model. Filters by `isActive: true` for public queries.

#### [NEW] `apps/api/src/modules/catalog/catalog.dto.ts`
`CreateProductDto` and `UpdateProductDto` with `class-validator`:
- `name: @IsString() @MinLength(2)`
- `sku: @IsString()`
- `price: @IsNumber() @Min(0)`
- `subPrice: @IsNumber() @Min(0)`
- `category: @IsString()`

#### [MODIFY] `apps/api/src/common/guards/clerk-auth.guard.ts`
Replace placeholder with real Clerk JWT verification using `@clerk/backend`.

#### [MODIFY] `apps/api/src/app.module.ts`
Register `CatalogModule` in root module imports.

#### [NEW] `apps/api/src/modules/aws-s3/aws-s3.module.ts`
S3-compatible module for Cloudflare R2.

#### [NEW] `apps/api/src/modules/aws-s3/aws-s3.service.ts`
Upload, download, delete operations against R2.

---

### Shared Packages

---

#### [MODIFY] `packages/types/src/product.ts`
Add `IProduct` interface with all fields. Add `ProductCategory` enum.

#### [MODIFY] `packages/types/src/index.ts`
Re-export product types.

---

### Frontend — Storefront (`apps/web`)

---

#### [MODIFY] `apps/web/src/app/layout.tsx`
Wrap with `ClerkProvider`. Import `UserHeader` and `Footer`.

#### [NEW] `apps/web/src/app/middleware.ts`
Clerk middleware: public routes (`/`, `/products/*`), protected routes (`/account/*`, `/checkout/*`).

#### [NEW] `apps/web/src/app/products/page.tsx`
Product listing page. Fetches from `GET /catalog/products`. Renders grid of `ProductCard` components.

#### [NEW] `apps/web/src/app/products/[id]/page.tsx`
Product detail page. Fetches from `GET /catalog/products/:id`. Renders `ProductDetail` component.

#### [NEW] `apps/web/src/components/UserHeader.tsx`
Responsive header: brand logo, nav links, cart icon, Clerk `UserButton`.

#### [NEW] `apps/web/src/components/Footer.tsx`
Brand footer with social links and legal links.

#### [NEW] `apps/web/src/components/ProductCard.tsx`
Card component: image, name, price, subscription price, savings badge, hover animation.

#### [NEW] `apps/web/src/components/ProductDetail.tsx`
Full product detail: image, description, pricing, quantity selector.

---

## Dependencies to Install

| Package | Where | Why |
|---|---|---|
| `@clerk/nextjs` | `apps/web` | Client-side auth provider, middleware, `UserButton` |
| `@clerk/backend` | `apps/api` | Server-side JWT verification for Clerk tokens |
| `@aws-sdk/client-s3` | `apps/api` | S3-compatible client for Cloudflare R2 uploads |
| `@aws-sdk/s3-request-presigner` | `apps/api` | Signed URL generation for private assets |
| `multer` + `@nestjs/platform-express` | `apps/api` | Multipart file upload handling |
| `sharp` | `apps/api` | Image optimization before R2 upload |

---

## Out of Scope (Week 3+)

- Cart functionality and checkout flow → Week 3
- Razorpay payment integration → Week 3
- Subscription toggle UI (beyond placeholder) → Week 7
- Admin product management UI → Week 5+
- Product search / filtering beyond category → Phase 3

---

## Verification Plan

### Automated Tests

1. **Catalog API unit tests** — `apps/api/src/modules/catalog/catalog.service.spec.ts`:
   ```bash
   cd apps/api && pnpm jest --testPathPattern=catalog
   ```
   - Test `findAll()` returns only `isActive: true` products
   - Test `create()` validates DTO
   - Test `update()` handles partial updates

2. **Build check**:
   ```bash
   pnpm turbo run build
   ```

### Browser Verification

3. **Storefront product listing** — `http://localhost:3000/products`:
   - Grid of product cards renders with seeded product data
   - Each card shows image, name, price, and subscription price
   - Cards are responsive (1 col mobile → 3 col desktop)

4. **Product detail page** — `http://localhost:3000/products/[id]`:
   - Product image, description, and pricing display correctly
   - Quantity selector works

5. **Clerk auth** — `http://localhost:3000`:
   - Sign In button visible when logged out
   - User avatar visible when logged in
   - Protected routes redirect to sign-in

6. **Swagger** — `http://localhost:4000/api/docs`:
   - All catalog endpoints documented
   - Try-it-out works for GET endpoints

### Manual Verification

7. **Image upload** — upload a product image via Swagger and confirm it appears on the storefront
8. **Clerk flow** — sign up a new user, verify `User` record created in database

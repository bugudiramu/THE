# Week 5: Ops Admin Dashboard v1

> **Blueprint Ref:** §8 (Ops Admin Dashboard), §13 Phase 1 Week 5, §7.2 (Daily Supply Chain Flow)
> **Sprint Goal:** Ops team can view, action, and dispatch today's orders entirely from `apps/admin` — never touching the customer storefront.

---

## Current State (End of Week 4)

| Area | Status |
|---|---|
| `apps/admin` | Bare skeleton — `layout.tsx` + `page.tsx` placeholder only |
| Prisma schema | `Order` model has full status FSM enum (`PENDING` → `PAID` → `PICKED` → `PACKED` → `DISPATCHED` → `DELIVERED` → `CANCELLED` → `REFUNDED`). `InventoryBatch` has FEFO-ready indexes. |
| API modules | `checkout`, `subscription`, `webhooks`, `catalog`, `cart`, `notifications`, `aws-s3` exist. **No dedicated `orders` module** for admin ops queries. |
| Shared packages | `packages/types` has `order.ts`, `product.ts`, `user.ts`. `packages/db` generates the Prisma client. Admin `next.config.js` already transpiles `@modern-essentials/types` and `@modern-essentials/utils`. |
| Auth | Clerk is integrated on `apps/web` and `apps/api`. **Not yet set up on `apps/admin`.** |
| Tests | None anywhere in the repo. |

---

## Objectives

1. Build the internal ops dashboard inside `apps/admin` (Next.js 14, App Router).
2. Create 4 core views: **Today's Orders**, **Pick List**, **Dispatch Manifest**, **Dashboard Home**.
3. Add a **NestJS `orders` module** in `apps/api` exposing admin-specific endpoints.
4. Wire `apps/admin` → `packages/db` + `packages/types` safely through Turborepo.
5. Establish the foundation (layout, sidebar nav, design system) for future views (Week 6+: Inventory, QC, Wastage).

---

## Key Deliverables

### Deliverable 1 — Admin Dashboard Foundation

Set up the shell: Clerk auth, sidebar navigation, global layout, and Tailwind + shadcn/ui design system.

| Item | Detail |
|---|---|
| Clerk auth on admin | Protect all admin routes. Use `ClerkProvider` in `layout.tsx`. Only users with an `ops` or `admin` role can access. |
| Sidebar layout | Collapsible sidebar with nav links: Dashboard, Today's Orders, Pick List, Dispatch Manifest. Responsive. |
| Design system | Install `shadcn/ui` in `apps/admin`. Configure `cn()` utility. Dark mode support for warehouse use. |
| `packages/db` wiring | Add `@modern-essentials/db` to admin's dependencies. Use Server Components to query Prisma directly (read-only). |

### Deliverable 2 — NestJS Admin Orders API

A new `orders` module in `apps/api` exposing read + action endpoints for the ops team.

| Endpoint | Method | Purpose |
|---|---|---|
| `GET /admin/orders/today` | GET | List today's orders with status counts (pending, packed, dispatched, delivered). Filterable by status. |
| `GET /admin/orders/:id` | GET | Order detail with line items + user info. |
| `PATCH /admin/orders/:id/status` | PATCH | Transition order status: `PAID → PICKED → PACKED → DISPATCHED → DELIVERED`. Validate legal transitions only. |
| `GET /admin/orders/pick-list` | GET | FEFO-sorted pick list: maps order items → batch IDs + bin locations. **Must ORDER BY expires_at ASC.** |
| `GET /admin/orders/dispatch-manifest` | GET | Route-wise manifest grouped by delivery area / pincode. |

> [!IMPORTANT]
> All pick-list queries MUST use `ORDER BY expires_at ASC` (FEFO rule, per §7.1). This is non-negotiable.

### Deliverable 3 — Today's Orders View

**Users:** Ops manager

| Feature | Detail |
|---|---|
| Status summary cards | 4 cards showing counts: Pending, Packed, Dispatched, Delivered for today. |
| Orders data table | Sortable + filterable table. Columns: Order ID, Customer, Items, Status, Placed At, Actions. |
| Quick action buttons | "Mark Picked" → "Mark Packed" → "Mark Dispatched" → "Mark Delivered". Each triggers `PATCH /admin/orders/:id/status`. |
| Exception queue | Filter view for `PAYMENT_FAILED` / `CANCELLED` orders needing attention. |

### Deliverable 4 — Pick List View

**Users:** Warehouse staff

| Feature | Detail |
|---|---|
| FEFO-sorted list | Each row: Order ID, Product SKU, Qty, **Batch ID**, **Bin Location**, **Expiry Date**. Strictly sorted by `expires_at ASC`. |
| Grouping | Group by product SKU for efficient warehouse picking. |
| Print button | Browser print-optimized CSS. One-click print for warehouse floor. |

### Deliverable 5 — Dispatch Manifest View

**Users:** Dispatch lead

| Feature | Detail |
|---|---|
| Route grouping | Orders grouped by delivery area / pincode. |
| Manifest table | Columns: Order ID, Customer Name, Address, Phone, Delivery Slot, Items, Courier. |
| Print / PDF | Print-optimized layout. Handed off to Shadowfax couriers. |
| Bulk dispatch | "Mark All Dispatched" button for a route group. |

---

## Proposed Changes

### Backend — NestJS API

---

#### [NEW] [orders.module.ts](file:///Users/ramu/Desktop/Projects/THE/modern-essentials/apps/api/src/modules/orders/orders.module.ts)
NestJS module registering the orders controller + service. Imports `PrismaModule`.

#### [NEW] [orders.controller.ts](file:///Users/ramu/Desktop/Projects/THE/modern-essentials/apps/api/src/modules/orders/orders.controller.ts)
Admin-only controller with routes:
- `GET /admin/orders/today` — today's orders with status counts
- `GET /admin/orders/pick-list` — FEFO pick list
- `GET /admin/orders/dispatch-manifest` — route-wise manifest
- `GET /admin/orders/:id` — single order detail
- `PATCH /admin/orders/:id/status` — status transitions

All routes guarded by `ClerkAuthGuard` (admin role).

#### [NEW] [orders.service.ts](file:///Users/ramu/Desktop/Projects/THE/modern-essentials/apps/api/src/modules/orders/orders.service.ts)
Business logic:
- `getTodayOrders(status?: OrderStatus)` — filters orders where `placedAt >= startOfDay`.
- `getStatusCounts()` — `groupBy` on status for today.
- `getPickList()` — joins `OrderItem` → `InventoryBatch`, **ORDER BY `expires_at ASC`**.
- `getDispatchManifest()` — groups packed orders by delivery area.
- `transitionStatus(orderId, newStatus)` — validates legal transitions, throws on illegal ones.

#### [NEW] [orders.dto.ts](file:///Users/ramu/Desktop/Projects/THE/modern-essentials/apps/api/src/modules/orders/orders.dto.ts)
DTOs: `UpdateOrderStatusDto` (class-validator), `OrderFilterDto`, `PickListResponseDto`, `ManifestResponseDto`.

#### [MODIFY] [app.module.ts](file:///Users/ramu/Desktop/Projects/THE/modern-essentials/apps/api/src/app.module.ts)
Register the new `OrdersModule` in the root module imports.

---

### Shared Packages

---

#### [MODIFY] [order.ts](file:///Users/ramu/Desktop/Projects/THE/modern-essentials/packages/types/src/order.ts)
Add shared types/interfaces for admin dashboard: `OrderStatusCount`, `PickListItem`, `ManifestGroup`, `OrderStatusTransition`.

---

### Frontend — Admin Dashboard (`apps/admin`)

---

#### [NEW] Admin Foundation Files
- `src/app/globals.css` — Tailwind base + shadcn/ui CSS variables (dark mode optimized)
- `src/lib/utils.ts` — `cn()` helper for shadcn/ui class merging
- `src/lib/api.ts` — API client wrapper to call `apps/api` endpoints

#### [MODIFY] [layout.tsx](file:///Users/ramu/Desktop/Projects/THE/modern-essentials/apps/admin/src/app/layout.tsx)
- Add `ClerkProvider` wrapper
- Import `globals.css` + Inter font
- Add sidebar navigation component

#### [NEW] Sidebar + Layout Components
- `src/components/sidebar.tsx` — Collapsible sidebar with nav links
- `src/components/header.tsx` — Top bar with user info + Clerk `UserButton`

#### [NEW] Dashboard Home Page
- `src/app/page.tsx` (overwrite) — Summary cards: Today's order count by status, quick links to Pick List and Manifest

#### [NEW] Today's Orders Page
- `src/app/orders/page.tsx` — Orders data table with filters + status action buttons
- `src/components/orders/order-table.tsx` — Interactive data table component
- `src/components/orders/status-cards.tsx` — Status count summary cards
- `src/components/orders/status-badge.tsx` — Color-coded order status badge

#### [NEW] Pick List Page
- `src/app/pick-list/page.tsx` — FEFO-sorted pick list with print optimization
- `src/components/pick-list/pick-list-table.tsx` — Pick list table grouped by SKU

#### [NEW] Dispatch Manifest Page
- `src/app/dispatch/page.tsx` — Route-grouped dispatch manifest
- `src/components/dispatch/manifest-table.tsx` — Manifest table with bulk dispatch action

---

### Dependencies to Install

| Package | Where | Why |
|---|---|---|
| `@clerk/nextjs` | `apps/admin` | Auth protection for admin routes |
| `@modern-essentials/db` | `apps/admin` | Direct Prisma queries in Server Components |
| `shadcn/ui` init | `apps/admin` | UI component library (Button, Table, Card, Badge, etc.) |
| `lucide-react` | `apps/admin` | Icon library for sidebar + actions |

---

## Out of Scope (Week 6+)

These views are listed in §8.1 of the blueprint but belong to Week 6 (Inventory & Reconciliation):
- Inventory Status view
- QC Log view
- Wastage Log view
- Subscription Overrides view
- Failed Deliveries view

---

## Verification Plan

### Automated Tests

1. **NestJS Orders Service Unit Tests** — `apps/api/src/modules/orders/orders.service.spec.ts`
   - Test `getStatusCounts()` returns correct groupings
   - Test `transitionStatus()` validates legal transitions and rejects illegal ones (e.g., `PENDING → DELIVERED`)
   - Test pick list query uses `ORDER BY expires_at ASC`
   - Run: `cd apps/api && pnpm jest --testPathPattern=orders`

2. **NestJS Orders Controller Integration Tests** — `apps/api/src/modules/orders/orders.controller.spec.ts`
   - Test each endpoint returns correct shape
   - Test status transition via PATCH
   - Run: `cd apps/api && pnpm jest --testPathPattern=orders`

### Browser Verification

3. **Admin Dashboard UI Walkthrough** — using the browser tool on `http://localhost:3001`
   - Verify sidebar renders with all nav links
   - Verify Dashboard Home shows status count cards
   - Verify Today's Orders page shows data table
   - Verify Pick List page shows FEFO-sorted data
   - Verify Dispatch Manifest page shows route-grouped data
   - Verify print button triggers browser print dialog

### Build Verification

4. **TypeScript + Build Check**
   - Run: `pnpm turbo run typecheck --filter=@modern-essentials/admin`
   - Run: `pnpm turbo run build --filter=@modern-essentials/admin`

### Manual Verification (User)

5. **Seed data walkthrough** — After implementation, seed a few test orders and verify:
   - Status cards show correct counts
   - Order status can be transitioned via action buttons
   - Pick list is sorted by expiry (soonest first)
   - Manifest groups orders by pincode/area

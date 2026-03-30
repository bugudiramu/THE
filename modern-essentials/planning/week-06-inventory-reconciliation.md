# Week 6: Inventory Batch Management, QC & Day-End Reconciliation

> **Blueprint Ref:** §3.2 (Quality Control — P0), §3.3 (Inventory Management FEFO — P0, WMS — P1), §6.1 (Module Ownership — Inventory), §6.2 (inventory_batches, farm_batches tables), §7.1 (The FEFO Rule), §7.2 (Daily Supply Chain Flow), §7.3 (QC Checklist per Batch), §8.1 (Dashboard Views — Inventory Status, QC Log, Wastage Log), §13 Phase 1 Week 6
> **Sprint Goal:** The ops team can record farm arrivals (GRN), perform QC checks, manage inventory batches with FEFO compliance, and run day-end reconciliation — all from the admin dashboard. The pick list correctly skips quarantined/rejected batches.

---

## Current State (End of Week 5)

| Area | Status |
|---|---|
| Admin dashboard | 4 views: Dashboard Home, Today's Orders, Pick List, Dispatch Manifest. Client Components with live data. |
| Orders API | `GET /admin/orders/today`, `/pick-list`, `/dispatch-manifest`, `PATCH /:id/status`. Full status FSM transitions. |
| Inventory schema | `InventoryBatch` model exists with `qty`, `expiresAt`, `locationId`, `status`, `qcStatus`. FEFO indexes. |
| Inventory API | **No dedicated inventory module**. Pick list queries exist in `OrdersService` but no GRN, QC, or reconciliation. |
| Farm traceability | `farm_batches` table referenced in §6.2 but **not yet in schema**. |
| Wastage logging | **No wastage log model or tracking**. |
| QC | **No QC endpoints or admin views**. |

---

## Objectives

1. Extend the **Prisma schema** with `Farm`, `FarmBatch`, and `WastageLog` models for full farm-to-door traceability.
2. Build the **NestJS inventory module** with GRN intake, QC recording, stock queries, and reconciliation endpoints.
3. Build **admin dashboard views** for Inventory Status, GRN Form, QC Log, and Wastage Log.
4. Implement **day-end reconciliation** flow to adjust physical vs. system stock with mandatory reason logging.
5. Ensure **FEFO compliance** — pick list queries MUST skip `QUARANTINE` and `REJECTED` batches and sort by `expiresAt ASC`.

---

## Key Deliverables

### Deliverable 1 — Database Schema Updates

Add to `packages/db/schema.prisma`:

| Model | Fields | Purpose |
|---|---|---|
| `Farm` | `id`, `name`, `location`, `contactName`, `contactPhone`, `isActive`, `createdAt` | Farm registry for sourcing traceability. |
| `FarmBatch` | `id`, `farmId`, `productId`, `qtyCollected`, `collectedAt`, `qcStatus`, `inventoryBatchId`, `temperatureOnArrival`, `notes` | Links farm supply to warehouse batch per §6.2. |
| `WastageLog` | `id`, `productId`, `inventoryBatchId?`, `qty`, `reason`, `loggedBy`, `loggedAt` | Audit trail for every unit written off. Mandatory `reason` field. |

**Enum additions:**
- `WastageReason`: `BREAKAGE_PACKING`, `BREAKAGE_TRANSIT`, `QC_REJECTED`, `EXPIRED`, `CUSTOMER_RETURN`, `OTHER`

**Relation updates:**
- `InventoryBatch` → add `farmBatch: FarmBatch?` relation
- `Farm` → add `batches: FarmBatch[]` relation

### Deliverable 2 — NestJS Inventory Module

| Endpoint | Method | Purpose |
|---|---|---|
| `GET /admin/inventory/summary` | GET | SKU-wise stock levels: total qty, available qty, QC pending qty, expiry alerts (< 3 days). |
| `GET /admin/inventory/batches` | GET | List all batches with pagination. Filter by `status`, `qcStatus`, `productId`. Sorted by `expiresAt ASC`. |
| `POST /admin/inventory/grn` | POST | Record new farm arrival. Creates `InventoryBatch` + `FarmBatch`. Sets `qcStatus: PENDING`. |
| `PATCH /admin/inventory/batches/:id/qc` | PATCH | Record QC result. Updates `qcStatus` to `PASSED`, `QUARANTINE`, or `REJECTED`. Records check details. |
| `POST /admin/inventory/reconcile` | POST | Log manual stock adjustment. Creates `WastageLog` entry. Adjusts `InventoryBatch.qty`. |
| `GET /admin/inventory/wastage` | GET | List wastage logs. Filter by date range, product, reason. Shows running monthly wastage %. |
| `GET /admin/inventory/farms` | GET | List registered farms. |
| `POST /admin/inventory/farms` | POST | Register a new farm. |

| Item | Detail |
|---|---|
| `inventory.module.ts` | Imports `PrismaModule`. Registers controller + service. |
| `inventory.controller.ts` | All endpoints guarded by `ClerkAuthGuard` (admin role). |
| `inventory.service.ts` | Business logic with strict validation. Cannot pick from `QUARANTINE` or `REJECTED` batches. |
| `inventory.dto.ts` | `CreateGrnDto`, `UpdateQcDto`, `ReconcileDto`, `CreateFarmDto` with `class-validator`. |

**GRN (Goods Receipt Note) flow per §7.2:**
1. Farm van arrives at warehouse (07:00).
2. Ops staff creates GRN via `POST /admin/inventory/grn`:
   - Product, quantity, farm source, collection date, temperature on arrival.
3. System creates `InventoryBatch` (status: `AVAILABLE`, qcStatus: `PENDING`) and linked `FarmBatch`.
4. Expiry date auto-calculated: `collectedAt + product shelf life (e.g., 21 days for eggs)`.

**QC flow per §7.3:**
1. QC officer performs checks: float test, visual inspection, weight grading, temperature log, expiry check.
2. Records result via `PATCH /admin/inventory/batches/:id/qc`:
   - `PASSED` → batch available for picking.
   - `QUARANTINE` → held for review. Cannot be picked.
   - `REJECTED` → permanently blocked. Written off to wastage log.

> [!IMPORTANT]
> Every Prisma query that picks inventory for orders MUST include:
> - `WHERE qcStatus = 'PASSED' AND status = 'AVAILABLE'`
> - `ORDER BY expiresAt ASC` (FEFO rule per §7.1)

### Deliverable 3 — Admin Dashboard: Inventory Views

| View | Route | Detail |
|---|---|---|
| Inventory Status | `/inventory` | SKU-wise summary cards: total stock, available, QC pending, expiry alerts (< 3 days). Active batch list with expiry countdown. |
| GRN Form | `/inventory/grn` | Form: product selector, quantity, farm selector, collection date, temperature, notes. Creates batch on submit. |
| QC Log | `/qc` | Table of recent QC checks. Columns: Batch ID, Product, Farm, Qty, QC Status, Checked At. Action buttons: Pass / Quarantine / Reject. |
| Wastage Log | `/wastage` | Table of wastage entries. Columns: Date, Product, Batch, Qty, Reason, Logged By. Monthly wastage % card (target < 3% per §12.2). |

### Deliverable 4 — Day-End Reconciliation

Per §7.2 (18:00 daily flow):

| Step | Detail |
|---|---|
| Physical count | Warehouse staff counts actual stock per location. |
| System comparison | Admin view shows system qty vs. input physical qty per batch. |
| Adjustment | Discrepancies logged via `POST /admin/inventory/reconcile`. Each adjustment creates a `WastageLog` entry. |
| Mandatory reason | Every adjustment requires a reason from `WastageReason` enum. No unexplained stock changes. |
| Alert | If wastage % exceeds 3% for the day, show a warning badge. |

---

## Proposed Changes

### Backend — NestJS API

---

#### [NEW] `apps/api/src/modules/inventory/inventory.module.ts`
NestJS module for inventory management. Imports `PrismaModule`.

#### [NEW] `apps/api/src/modules/inventory/inventory.controller.ts`
Admin-only controller with all inventory endpoints. Guarded by `ClerkAuthGuard`.

#### [NEW] `apps/api/src/modules/inventory/inventory.service.ts`
Business logic:
- `getSummary()` — aggregates stock by product SKU with expiry alerts.
- `getBatches(filters)` — paginated batch list, FEFO sorted.
- `createGrn(dto)` — creates `InventoryBatch` + `FarmBatch` with auto-calculated expiry.
- `updateQc(batchId, dto)` — validates transition, updates `qcStatus`, creates `WastageLog` on `REJECTED`.
- `reconcile(dto)` — adjusts batch qty, creates `WastageLog` with mandatory reason.
- `getWastageLogs(filters)` — filtered wastage entries with monthly % calculation.

#### [NEW] `apps/api/src/modules/inventory/inventory.dto.ts`
DTOs with `class-validator`:
- `CreateGrnDto { productId, qty, farmId, collectedAt, temperatureOnArrival, notes }`
- `UpdateQcDto { qcStatus, floatTestResult?, visualResult?, weightGrade?, temperatureLog?, notes? }`
- `ReconcileDto { batchId, physicalQty, reason, notes? }`
- `CreateFarmDto { name, location, contactName, contactPhone }`

#### [MODIFY] `apps/api/src/app.module.ts`
Register `InventoryModule`.

#### [MODIFY] `apps/api/src/modules/orders/orders.service.ts`
Update `getPickList()` to strictly filter `qcStatus = 'PASSED' AND status = 'AVAILABLE'` before FEFO sort.

---

### Shared Packages

---

#### [MODIFY] `packages/db/schema.prisma`
- Add `Farm`, `FarmBatch`, `WastageLog` models.
- Add `WastageReason` enum.
- Add relations: `InventoryBatch ↔ FarmBatch`, `Farm ↔ FarmBatch`.
- Run: `pnpm db:generate && pnpm db:migrate`.

#### [NEW] `packages/types/src/inventory.ts`
`IInventorySummary`, `IBatch`, `IGrnPayload`, `IQcResult`, `IReconciliation`, `IWastageLog` interfaces.

#### [MODIFY] `packages/types/src/index.ts`
Re-export inventory types.

---

### Frontend — Admin Dashboard (`apps/admin`)

---

#### [NEW] `apps/admin/src/app/inventory/page.tsx`
Inventory status view. Client Component. Fetches from `GET /admin/inventory/summary` + `GET /admin/inventory/batches`.

#### [NEW] `apps/admin/src/app/inventory/grn/page.tsx`
GRN entry form. Product dropdown, farm dropdown, quantity, temperature, collection date.

#### [NEW] `apps/admin/src/app/qc/page.tsx`
QC log view. Table of batches pending QC. Action buttons for Pass/Quarantine/Reject.

#### [NEW] `apps/admin/src/app/wastage/page.tsx`
Wastage log view. Table with date filters. Monthly wastage % card.

#### [MODIFY] `apps/admin/src/components/sidebar.tsx`
Add nav links: Inventory, GRN, QC Log, Wastage Log.

---

## Dependencies to Install

| Package | Where | Why |
|---|---|---|
| No new packages required | — | All dependencies installed in previous weeks. Prisma, NestJS, React are already available. |

---

## Out of Scope (Week 7+)

- Razorpay subscription integration → Week 7
- Subscription FSM → Week 8
- Dunning sequence → Week 9
- BOM / packaging material management → Phase 3
- Cold chain monitoring alerts → Phase 2
- Barcode/QR code generation on packing labels → Week 17-18
- Farm profile pages (Sanity CMS) → Week 17-18
- Zoho Books integration → external ops setup (not code)

---

## Verification Plan

### Automated Tests

1. **Inventory service unit tests** — `apps/api/src/modules/inventory/inventory.service.spec.ts`:
   ```bash
   cd apps/api && pnpm jest --testPathPattern=inventory
   ```
   - Test `createGrn()` calculates expiry correctly (collectedAt + 21 days)
   - Test `updateQc()` validates legal QC status transitions
   - Test `updateQc('REJECTED')` auto-creates `WastageLog` entry
   - Test `reconcile()` requires mandatory reason
   - Test `reconcile()` adjusts batch qty correctly
   - Test `getSummary()` aggregates by product correctly

2. **FEFO compliance test**:
   - Test `getPickList()` returns batches sorted by `expiresAt ASC`
   - Test `getPickList()` excludes `QUARANTINE` and `REJECTED` batches
   - Test `getPickList()` excludes `DEPLETED` batches

3. **Build check**:
   ```bash
   pnpm turbo run build
   ```

### Browser Verification

4. **Inventory status** — `http://localhost:3001/inventory`:
   - Summary cards show correct stock counts
   - Batch list shows expiry countdown
   - Batches expiring < 3 days have red alert badges

5. **GRN form** — `http://localhost:3001/inventory/grn`:
   - Form submits successfully
   - New batch appears in inventory list with `QC: PENDING`

6. **QC log** — `http://localhost:3001/qc`:
   - Pending batches listed
   - Pass/Quarantine/Reject buttons work
   - Rejected batch creates wastage log entry
   - Quarantined batch disappears from pick list

7. **Wastage log** — `http://localhost:3001/wastage`:
   - Entries listed with reason codes
   - Monthly wastage % calculated correctly

### Manual Verification

8. **Full GRN → QC → Pick flow**:
   - Create GRN for a product
   - Perform QC → mark as PASSED
   - Verify batch appears in pick list (`/pick-list`)
   - Verify batch is FEFO-sorted (soonest expiry first)

9. **Reconciliation flow**:
   - Adjust a batch qty via reconciliation
   - Verify `WastageLog` entry created
   - Verify batch qty updated in inventory
   - Verify inventory summary reflects the change

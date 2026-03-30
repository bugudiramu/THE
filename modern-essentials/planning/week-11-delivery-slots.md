# Week 11: Delivery Slot Management & Hub Capacity

> **Blueprint Ref:** §6.2 (delivery_slots, hubs tables), §7.2 (Daily Supply Chain Flow — delivery windows), §7.4 (Shipping Partners — Shadowfax), §8.1 (Dashboard Views), §13 Phase 2 Week 11
> **Sprint Goal:** Customers can select a delivery slot during checkout with real-time capacity checks, the ops team can manage hub capacity and slot availability, and orders are routed to the correct hub based on customer pincode.

---

## Current State (End of Week 10)

| Area | Status |
|---|---|
| Checkout | One-time and subscription checkout working. **No delivery slot selection**. |
| Schema | `DeliverySlot` and `Hub` models exist in blueprint (§6.2) but **not yet in schema**. |
| Delivery | Orders have customer address but **no delivery time preferences or slot assignments**. |
| Hub routing | **No hub management**. All orders treated as single-hub. |
| Ops visibility | **No slot capacity view** in admin dashboard. |

---

## Objectives

1. Add **`DeliverySlot`** and **`Hub`** models to Prisma schema.
2. Build the **logistics module** in NestJS — slot management, capacity checks, hub routing.
3. Build the **slot picker UI** in the checkout flow with real-time availability.
4. Implement **hub-based order routing** — pincode → hub mapping.
5. Build **admin slot capacity view** — ops team can manage daily slot capacity.

---

## Key Deliverables

### Deliverable 1 — Database Schema Updates

| Model | Fields | Purpose |
|---|---|---|
| `Hub` | `id`, `name`, `city`, `pincodes: String[]`, `lat`, `lng`, `capacity`, `isActive`, `createdAt` | Fulfilment hub. Array of serviceable pincodes. |
| `DeliverySlot` | `id`, `hubId`, `date`, `startTime`, `endTime`, `pincode`, `capacity`, `bookedCount`, `isActive` | Time-bounded slot per hub per day. `bookedCount` increments on order. |
| `Address` | `id`, `userId`, `line1`, `line2`, `city`, `state`, `pincode`, `lat?`, `lng?`, `hubId?`, `isDefault`, `createdAt` | User delivery addresses. `hubId` set by pincode lookup. |

**Relations:**
- `Hub` → `DeliverySlot[]`, `Address[]`
- `Order` → add `deliverySlotId?`, `addressId?` foreign keys

### Deliverable 2 — NestJS Logistics Module

| Endpoint | Method | Purpose |
|---|---|---|
| `GET /logistics/slots` | GET | Available slots for a pincode + date. Returns only slots where `bookedCount < capacity`. |
| `POST /logistics/slots/book` | POST | Book a slot for an order. Increments `bookedCount`. Fails if full. |
| `GET /admin/logistics/hubs` | GET | List all hubs with capacity. |
| `POST /admin/logistics/hubs` | POST | Create a new hub with serviceable pincodes. |
| `GET /admin/logistics/slots` | GET | List slots for a hub + date. Shows booked vs capacity. |
| `POST /admin/logistics/slots` | POST | Create delivery slots for a hub + date (batch create). |
| `PATCH /admin/logistics/slots/:id` | PATCH | Update slot capacity or active status. |

| Item | Detail |
|---|---|
| `logistics.module.ts` | Imports `PrismaModule`. |
| `logistics.controller.ts` | Public slot query + guarded admin endpoints. |
| `logistics.service.ts` | Slot availability, booking with atomic `bookedCount` increment, hub routing. |
| `logistics.dto.ts` | `QuerySlotsDto`, `BookSlotDto`, `CreateHubDto`, `CreateSlotDto`. |

**Slot booking flow:**
1. Customer enters pincode during checkout.
2. System maps pincode → hub (via `Hub.pincodes` array lookup).
3. System returns available slots for that hub + requested date.
4. Customer selects a slot.
5. On order confirmation: `bookedCount` incremented atomically (using Prisma `$transaction`).
6. If `bookedCount >= capacity`: slot becomes unavailable for new bookings.

> [!IMPORTANT]
> Slot booking MUST use an atomic transaction to prevent overbooking. Use `prisma.$transaction` with optimistic locking or `UPDATE ... WHERE bookedCount < capacity`.

### Deliverable 3 — Checkout Slot Picker UI

| Component | Detail |
|---|---|
| `SlotPicker.tsx` | Date selector + time slot grid. Shows available slots with remaining capacity indicator. Disabled slots greyed out. |
| `AddressSelector.tsx` | List saved addresses + "Add new address" form. Pincode triggers hub lookup. |
| Checkout integration | After address step → slot picker step. Selected slot stored with order. |

**Slot display per §7.2:**
- Morning: 10:00 AM – 12:00 PM
- Afternoon: 12:00 PM – 2:00 PM
- Custom slots configurable by ops team.

### Deliverable 4 — Admin Slot Capacity View

| View | Route | Detail |
|---|---|---|
| Hub management | `/hubs` (admin) | List hubs, create new hub, edit serviceable pincodes. |
| Slot capacity | `/slots` (admin) | Calendar view: select date → see all slots for each hub. Booked/capacity ratio. Create/edit slots. |

### Deliverable 5 — User Address Management

| Page | Route | Detail |
|---|---|---|
| Saved addresses | `/account/addresses` | List addresses, add new, edit, set default, delete. |

| Endpoint | Method | Purpose |
|---|---|---|
| `GET /addresses` | GET | List user's saved addresses. |
| `POST /addresses` | POST | Add new address. Auto-maps pincode to hub. |
| `PATCH /addresses/:id` | PATCH | Update address. |
| `DELETE /addresses/:id` | DELETE | Remove address. |

---

## Proposed Changes

### Backend — NestJS API

---

#### [NEW] `apps/api/src/modules/logistics/logistics.module.ts`
Logistics module for slot and hub management.

#### [NEW] `apps/api/src/modules/logistics/logistics.controller.ts`
Public slot queries + admin hub/slot management. All admin routes guarded.

#### [NEW] `apps/api/src/modules/logistics/logistics.service.ts`
`getAvailableSlots()`, `bookSlot()`, `createHub()`, `createSlots()`, `mapPincodeToHub()`.

#### [NEW] `apps/api/src/modules/logistics/logistics.dto.ts`
`QuerySlotsDto`, `BookSlotDto`, `CreateHubDto`, `CreateSlotBatchDto`, `CreateAddressDto`.

#### [MODIFY] `apps/api/src/modules/checkout/checkout.service.ts`
On order creation: book delivery slot (increment `bookedCount`), save `deliverySlotId` and `addressId` on order.

#### [MODIFY] `apps/api/src/app.module.ts`
Register `LogisticsModule`.

---

### Shared Packages

---

#### [MODIFY] `packages/db/schema.prisma`
- Add `Hub`, `DeliverySlot`, `Address` models.
- Add `deliverySlotId`, `addressId` to `Order`.
- Add `hubId` to `Address`.
- Add relations and indexes.
- Run: `pnpm db:generate && pnpm db:migrate`.

#### [NEW] `packages/types/src/logistics.ts`
`IHub`, `IDeliverySlot`, `IAddress`, `SlotAvailability` types.

#### [MODIFY] `packages/types/src/index.ts`
Re-export logistics types.

---

### Frontend — Storefront (`apps/web`)

---

#### [NEW] `apps/web/src/components/SlotPicker.tsx`
Date + time slot picker with availability indicators.

#### [NEW] `apps/web/src/components/AddressSelector.tsx`
Saved addresses list + add new address form.

#### [MODIFY] `apps/web/src/app/checkout/page.tsx`
Add address selection step + slot picker step before payment.

#### [NEW] `apps/web/src/app/account/addresses/page.tsx`
User address management page.

---

### Frontend — Admin Dashboard (`apps/admin`)

---

#### [NEW] `apps/admin/src/app/hubs/page.tsx`
Hub management view.

#### [NEW] `apps/admin/src/app/slots/page.tsx`
Slot capacity calendar view.

#### [MODIFY] `apps/admin/src/components/sidebar.tsx`
Add "Hubs" and "Slots" nav links.

---

## Dependencies to Install

| Package | Where | Why |
|---|---|---|
| `date-fns` | `apps/web`, `apps/admin` | Date formatting and slot date calculations |

---

## Out of Scope (Week 12+)

- Subscription QA + stress tests → Week 12
- Shadowfax courier API integration → Phase 2+
- Route optimization for delivery agents → Phase 4
- Dark store / multi-hub routing → Phase 4
- Real-time GPS tracking → Phase 4

---

## Verification Plan

### Automated Tests

1. **Slot booking tests** — `apps/api/src/modules/logistics/logistics.service.spec.ts`:
   ```bash
   cd apps/api && pnpm jest --testPathPattern=logistics
   ```
   - Test `getAvailableSlots()` returns only slots where `bookedCount < capacity`
   - Test `bookSlot()` atomically increments `bookedCount`
   - Test `bookSlot()` rejects when slot is full
   - Test `mapPincodeToHub()` returns correct hub

2. **Overbooking prevention**:
   - Test concurrent slot bookings don't exceed capacity (race condition test)

3. **Build check**:
   ```bash
   pnpm turbo run build
   ```

### Browser Verification

4. **Checkout slot selection** — `http://localhost:3000/checkout`:
   - Address step → pincode triggers hub lookup
   - Slot picker shows available times
   - Full slots are greyed out
   - Selected slot saved with order

5. **Admin slot view** — `http://localhost:3001/slots`:
   - Calendar shows slots by date
   - Booked/capacity ratio displayed
   - Can create new slots

### Manual Verification

6. **Capacity test**: Book multiple orders until a slot fills → verify subsequent orders can't select that slot
7. **Hub routing**: Create orders for different pincodes → verify they route to correct hubs

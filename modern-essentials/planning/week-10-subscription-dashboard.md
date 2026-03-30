# Week 10: User Subscription Self-Service Dashboard

> **Blueprint Ref:** §9.2 (Self-Service Features — No Support Contact Required), §6.3 (FSM: `ACTIVE → PAUSED`, `PAUSED → ACTIVE`, `ACTIVE → CANCELLED`), §8.1 (Subscription Overrides — Admin), §13 Phase 2 Week 10
> **Sprint Goal:** A subscriber can pause, skip, modify quantity, change frequency, swap product variant, and cancel their subscription entirely from a self-service dashboard — without ever needing to contact support. The admin dashboard gains a subscription overrides view for customer support escalations.

---

## Current State (End of Week 9)

| Area | Status |
|---|---|
| Subscription FSM | All 9 transitions working. Dunning sequence automated. Auto-cancel on Day 8. |
| User subscription API | `POST /subscriptions/create`, `GET /subscriptions/mine`, `GET /subscriptions/:id`. |
| User subscription UI | **None**. Subscribers cannot view, modify, or cancel their subscriptions from the storefront. |
| Self-service features per §9.2 | **0 of 7 implemented**: Pause ✗, Skip ✗, Change frequency ✗, Change quantity ✗, Change address ✗, Swap variant ✗, Cancel ✗. |
| Admin subscription view | **None**. Ops team cannot override subscriptions. |

---

## Objectives

1. Build the **subscriber dashboard** at `/account/subscriptions` — list, detail, and manage active subscriptions.
2. Implement all **7 self-service features** from §9.2 (pause, skip, change frequency, change quantity, change address, swap variant, cancel with save flow).
3. Build **cancel with save flow** — multi-step retention dialog before allowing cancellation.
4. Build **admin subscription overrides view** — ops team can manage any subscription with reason logging.
5. Add API endpoints for each self-service action.

---

## Key Deliverables

### Deliverable 1 — Subscription Dashboard UI

| Page | Route | Detail |
|---|---|---|
| Subscriptions list | `/account/subscriptions` | List of user's subscriptions with status badges, next delivery date, product image, pricing. |
| Subscription detail | `/account/subscriptions/[id]` | Full detail: product, quantity, frequency, price, status, next billing, next delivery, action buttons. |

### Deliverable 2 — Self-Service API Endpoints

| Endpoint | Method | Feature | Detail |
|---|---|---|---|
| `PATCH /subscriptions/:id/pause` | PATCH | Pause | Set `pauseUntil` (1-4 weeks). Transition `ACTIVE → PAUSED`. Suspend billing. |
| `PATCH /subscriptions/:id/resume` | PATCH | Resume | Transition `PAUSED → ACTIVE`. Re-queue billing job. |
| `PATCH /subscriptions/:id/skip` | PATCH | Skip next delivery | Skip the next delivery without pausing. Advance `nextDeliveryAt`. |
| `PATCH /subscriptions/:id/frequency` | PATCH | Change frequency | Update frequency (weekly ↔ fortnightly ↔ monthly). Recalculate `nextBillingAt`. |
| `PATCH /subscriptions/:id/quantity` | PATCH | Change quantity | Update qty. If Razorpay subscription amount changes, update Razorpay plan. |
| `PATCH /subscriptions/:id/address` | PATCH | Change address | Update delivery address for future deliveries. |
| `PATCH /subscriptions/:id/product` | PATCH | Swap variant | Change product (e.g., Regular → Brown eggs). Same frequency. |
| `POST /subscriptions/:id/cancel` | POST | Cancel | Cancel with reason. Transition `ACTIVE → CANCELLED`. Cancel Razorpay sub. |

### Deliverable 3 — Cancel With Save Flow (§9.2)

Multi-step retention dialog when user clicks "Cancel":

| Step | UI | Purpose |
|---|---|---|
| 1. Value summary | "In 3 months, you've saved ₹450 and received 72 eggs!" | Remind user of value. Show total savings, total deliveries. |
| 2. Offer pause | "Need a break? Pause instead of cancelling." + duration picker (1-4 weeks). | Redirect to pause if user is just temporarily unavailable. |
| 3. Reason collection | Dropdown: "Too expensive", "Quality issue", "Too many eggs", "Switching brand", "Other". | Data for churn analysis. Mandatory before cancel. |
| 4. Confirm cancel | "We're sorry to see you go. Cancel subscription?" + warning about losing saved preferences. | Final confirmation. |
| 5. Post-cancel | "Your subscription has been cancelled. You can reactivate anytime." + reactivation CTA. | Soft landing with easy return path. |

### Deliverable 4 — Self-Service UI Components

| Component | Detail |
|---|---|
| `SubscriptionCard.tsx` | Card showing: product image, name, qty, frequency, next delivery, status badge, "Manage" button. |
| `PauseDialog.tsx` | Modal: duration picker (1-4 weeks), pause reason, "Pause Subscription" button. |
| `SkipDialog.tsx` | Modal: "Skip your next delivery on [date]?". Shows next delivery after skip. |
| `FrequencyPicker.tsx` | Radio group: Weekly / Fortnightly / Monthly. Shows price difference. |
| `QuantityPicker.tsx` | Stepper: quantity selector (e.g., 6, 12, 24, 30). Shows updated price. |
| `CancelFlow.tsx` | Multi-step dialog implementing the save flow above. |
| `AddressEditor.tsx` | Form to update delivery address for a specific subscription. |
| `ProductSwapPicker.tsx` | Card grid of available variants. Highlights current selection. |

### Deliverable 5 — Admin Subscription Overrides (§8.1)

| View | Route | Detail |
|---|---|---|
| Subscription overrides | `/subscriptions` (admin) | Search by user, filter by status. Table: User, Product, Qty, Frequency, Status, Actions. |
| Override action | — | Admin can: force pause, force cancel, extend, modify qty/frequency — with mandatory reason log. |

| API Endpoint | Method | Purpose |
|---|---|---|
| `GET /admin/subscriptions` | GET | List all subscriptions with filters (status, user, product). |
| `PATCH /admin/subscriptions/:id/override` | PATCH | Admin override action with mandatory `reason` field. |

---

## Proposed Changes

### Backend — NestJS API

---

#### [MODIFY] `apps/api/src/modules/subscription/subscription.controller.ts`
Add all self-service endpoints: `pause`, `resume`, `skip`, `frequency`, `quantity`, `address`, `product`, `cancel`.

#### [MODIFY] `apps/api/src/modules/subscription/subscription.service.ts`
Implement:
- `pauseSubscription(subId, userId, duration)` — validates ownership, sets `pauseUntil`, suspends billing.
- `resumeSubscription(subId, userId)` — validates ownership, re-queues billing.
- `skipNextDelivery(subId, userId)` — advances `nextDeliveryAt` by one interval.
- `changeFrequency(subId, userId, newFreq)` — updates frequency, recalculates billing.
- `changeQuantity(subId, userId, newQty)` — updates qty, may update Razorpay plan.
- `changeAddress(subId, userId, addressId)` — updates delivery address.
- `swapProduct(subId, userId, newProductId)` — swaps product, same frequency.
- `cancelSubscription(subId, userId, reason)` — save flow validated server-side, cancels Razorpay.

#### [MODIFY] `apps/api/src/modules/subscription/subscription.dto.ts`
Add: `PauseSubscriptionDto`, `SkipDeliveryDto`, `ChangeFrequencyDto`, `ChangeQuantityDto`, `CancelSubscriptionDto`, `AdminOverrideDto`.

#### [NEW] `apps/api/src/modules/subscription/admin-subscription.controller.ts`
Admin-only endpoints: `GET /admin/subscriptions`, `PATCH /admin/subscriptions/:id/override`.

---

### Shared Packages

---

#### [MODIFY] `packages/db/schema.prisma`
- Add `SubscriptionLog` model: `id`, `subscriptionId`, `action`, `oldValue`, `newValue`, `reason`, `performedBy`, `createdAt`. Audit trail for all modifications.
- Add `skipCount: Int @default(0)` to `Subscription`.
- Run: `pnpm db:generate && pnpm db:migrate`.

---

### Frontend — Storefront (`apps/web`)

---

#### [NEW] `apps/web/src/app/account/subscriptions/page.tsx`
Subscription list page. Shows all user's subscriptions with status + manage button.

#### [NEW] `apps/web/src/app/account/subscriptions/[id]/page.tsx`
Subscription detail page with all self-service action buttons.

#### [NEW] `apps/web/src/components/subscriptions/SubscriptionCard.tsx`
Card component for subscription list.

#### [NEW] `apps/web/src/components/subscriptions/PauseDialog.tsx`
Pause modal with duration picker.

#### [NEW] `apps/web/src/components/subscriptions/SkipDialog.tsx`
Skip delivery confirmation modal.

#### [NEW] `apps/web/src/components/subscriptions/CancelFlow.tsx`
Multi-step cancel with save flow.

#### [NEW] `apps/web/src/components/subscriptions/FrequencyPicker.tsx`
Frequency selection radio group.

#### [NEW] `apps/web/src/components/subscriptions/QuantityPicker.tsx`
Quantity stepper component.

#### [MODIFY] `apps/web/src/components/UserHeader.tsx`
Add "My Subscriptions" link in user dropdown.

---

### Frontend — Admin Dashboard (`apps/admin`)

---

#### [NEW] `apps/admin/src/app/subscriptions/page.tsx`
Admin subscription overrides view with search, filter, and action buttons.

#### [MODIFY] `apps/admin/src/components/sidebar.tsx`
Add "Subscriptions" nav link.

---

## Dependencies to Install

| Package | Where | Why |
|---|---|---|
| `@radix-ui/react-dialog` | `apps/web` | Accessible modal dialogs for pause/skip/cancel flows |
| `@radix-ui/react-radio-group` | `apps/web` | Radio group for frequency picker |

---

## Out of Scope (Week 11+)

- Delivery slot selection → Week 11
- Subscription QA + stress testing → Week 12
- Rewards from subscription orders → Week 13
- Live WhatsApp notifications → when Interakt key available

---

## Verification Plan

### Automated Tests

1. **Self-service endpoint tests** — `apps/api/src/modules/subscription/subscription.service.spec.ts`:
   ```bash
   cd apps/api && pnpm jest --testPathPattern=subscription
   ```
   - Test `pauseSubscription()` sets `pauseUntil` correctly (1/2/3/4 weeks)
   - Test `pauseSubscription()` rejects if already `PAUSED`
   - Test `resumeSubscription()` transitions `PAUSED → ACTIVE`
   - Test `skipNextDelivery()` advances `nextDeliveryAt` by correct interval
   - Test `changeQuantity()` updates subscription and logs change
   - Test `cancelSubscription()` requires reason
   - Test ownership validation: user can only modify their own subscription

2. **Cancel save flow test**:
   - Test cancellation requires reason from approved list
   - Test `SubscriptionLog` entry created with before/after values

3. **Build check**:
   ```bash
   pnpm turbo run build
   ```

### Browser Verification

4. **Subscription dashboard** — `http://localhost:3000/account/subscriptions`:
   - Lists all user's subscriptions with correct status badges
   - "Manage" button opens detail page

5. **Self-service actions**:
   - Pause → dialog opens, select 2 weeks, confirm → status changes to `PAUSED`
   - Skip → next delivery date advances
   - Change frequency → price updates, next billing recalculated
   - Cancel → save flow steps display correctly, reason required

6. **Admin overrides** — `http://localhost:3001/subscriptions`:
   - Search works by user
   - Override with reason creates log entry

### Manual Verification

7. **Database audit trail** — every self-service action should have a `SubscriptionLog` entry
8. **Razorpay sync** — pause/cancel actions should reflect in Razorpay dashboard

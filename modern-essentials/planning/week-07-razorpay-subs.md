# Week 7: Razorpay Subscriptions API Integration & Subscription-First UI

> **Blueprint Ref:** §2.1 (Revenue Streams — Subscriptions core), §3.1 (Subscription Engine — P0), §4.1 (Payments: Razorpay Subscriptions API), §6.3 (Subscription State Machine), §6.4 (Webhook Catalogue — `subscription.activated`), §9.1 (Subscription Toggle), §13 Phase 2 Week 7
> **Sprint Goal:** A customer can select "Subscribe & Save" on any product page, choose a frequency, and complete a Razorpay recurring mandate (UPI autopay / card) — with the subscription recorded in the database in `PENDING` status, awaiting the `subscription.activated` webhook.

---

## Current State (End of Week 6)

| Area | Status |
|---|---|
| Payments | One-time Razorpay payments working. `POST /checkout/create-order` + `POST /checkout/verify-payment`. |
| Subscriptions | `Subscription` model in schema with full enum: `PENDING`, `ACTIVE`, `PAUSED`, `RENEWAL_DUE`, `DUNNING`, `CANCELLED`. |
| Subscription API | `POST /checkout/create-subscription-plan`, `POST /checkout/create-subscription` exist but are **basic POC-level**. No Razorpay Plan management, no mandate flow. |
| Storefront UI | Product pages show prices but **no subscription toggle**. All purchases are one-time. |
| Webhooks | `payment.captured` and `payment.failed` handled. **No subscription webhook handlers**. |
| BullMQ | Notification queue running. No subscription renewal or dunning jobs. |

---

## Objectives

1. Build **Razorpay Plan management** — dynamically create and cache Razorpay Plans for product/frequency combinations.
2. Implement **Razorpay Subscription creation** — full mandate flow with `subscription_id` checkout.
3. Build the **Subscription Toggle UI** per §9.1 — subscription is the default, one-time is secondary.
4. Handle the **`subscription.activated` webhook** — transition subscription to `ACTIVE`.
5. Support **hybrid carts** — mix of subscription and one-time items.

---

## Key Deliverables

### Deliverable 1 — Razorpay Plan Management

| Item | Detail |
|---|---|
| Plan caching | Before creating a Razorpay subscription, check if a Plan already exists for the `productId + frequency + price` combo. Cache Plan IDs in a new `SubscriptionPlan` model. |
| Dynamic creation | If no Plan exists, create one via `razorpay.plans.create()` with item name, amount (in paise), period, and interval. |
| Plan model | Add `SubscriptionPlan` to Prisma: `id`, `productId`, `frequency`, `amount`, `razorpayPlanId`, `isActive`. |

### Deliverable 2 — Subscription Module (NestJS)

| Endpoint | Method | Purpose |
|---|---|---|
| `POST /subscriptions/create` | POST | Create a Razorpay subscription for the user. Returns `subscription_id` for checkout modal. |
| `GET /subscriptions/mine` | GET | List current user's subscriptions with status. |
| `GET /subscriptions/:id` | GET | Get single subscription details. |

| Item | Detail |
|---|---|
| `subscription.module.ts` | Imports `PrismaModule`, `NotificationsModule`. |
| `subscription.controller.ts` | Endpoints guarded by `ClerkAuthGuard`. |
| `subscription.service.ts` | `createSubscription(userId, productId, qty, frequency)` — finds/creates Razorpay Plan, creates Razorpay Subscription, saves `Subscription` record with status `PENDING`. |
| `subscription.dto.ts` | `CreateSubscriptionDto { productId, quantity, frequency }`. |

**Subscription creation flow:**
1. User selects "Subscribe & Save" + frequency on product page.
2. Frontend calls `POST /subscriptions/create`.
3. Backend finds/creates Razorpay Plan for product+frequency.
4. Backend creates Razorpay Subscription with `plan_id` and `customer_notify: 1`.
5. Returns `{ subscriptionId, shortUrl }` to frontend.
6. Frontend opens Razorpay checkout modal with `subscription_id` (not `order_id`).
7. User authenticates mandate (UPI autopay / card).
8. Razorpay sends `subscription.activated` webhook → backend transitions to `ACTIVE`.

### Deliverable 3 — Subscription Toggle UI (§9.1)

The toggle is the most important UI element:

| Option | Visual | Price Shown |
|---|---|---|
| Subscribe (DEFAULT) | Selected, teal/brand border, "Save 10%" badge prominently displayed | Discounted `subPrice` + frequency selector dropdown (Weekly / Fortnightly / Monthly) |
| One-time | Unselected, plain border, no badge | Full `price` |

| Component | Detail |
|---|---|
| `SubscriptionToggle.tsx` | Toggle between Subscribe and One-time. Subscribe selected by default. Shows savings amount. |
| `FrequencySelector.tsx` | Dropdown: Weekly, Fortnightly, Monthly. Updates price display. |
| Product page update | Integrate toggle into `ProductDetail`. "Add to Cart" vs "Subscribe & Save" button based on toggle state. |

### Deliverable 4 — Suggested Subscription Plans

Pre-configured plans based on typical Indian household consumption:

| Plan Name | Qty | Frequency | Target Customer |
|---|---|---|---|
| Solo/Couple Pack | 6 eggs | Weekly | Small households |
| Standard Weekly | 12 eggs | Weekly | Family standard |
| Protein Pack | 30 eggs | Weekly | Gym-goers / high-protein diet |
| Monthly Saver | 30 eggs | Monthly | Budget-conscious families |
| Premium Brown | 10 eggs | Weekly | Health-conscious premium users |

Subscriber discount: 10-15% off regular price (per §2.1).

### Deliverable 5 — Webhook: `subscription.activated`

| Event | Action |
|---|---|
| `subscription.activated` | 1. Idempotency check (as always). 2. Find `Subscription` by `razorpaySubId`. 3. Transition `PENDING → ACTIVE`. 4. Create first delivery `Order` with `type: SUBSCRIPTION_RENEWAL`. 5. Send welcome WhatsApp notification. |

---

## Proposed Changes

### Backend — NestJS API

---

#### [MODIFY] `apps/api/src/modules/subscription/subscription.module.ts`
Full module with controller + service + imports.

#### [MODIFY] `apps/api/src/modules/subscription/subscription.controller.ts`
New endpoints: `POST /subscriptions/create`, `GET /subscriptions/mine`, `GET /subscriptions/:id`.

#### [MODIFY] `apps/api/src/modules/subscription/subscription.service.ts`
Complete rewrite:
- `createSubscription()` — Plan management + Razorpay Subscription creation.
- `findUserSubscriptions()` — list user's subs.
- `transitionStatus()` — FSM transition (placeholder for full FSM in Week 8).

#### [MODIFY] `apps/api/src/modules/subscription/subscription.dto.ts`
`CreateSubscriptionDto`, `SubscriptionResponseDto`.

#### [MODIFY] `apps/api/src/modules/webhooks/webhooks.service.ts`
Add handler for `subscription.activated`:
- Find subscription by `razorpaySubId`.
- Transition to `ACTIVE`.
- Create first delivery order.
- Trigger welcome notification.

#### [MODIFY] `apps/api/src/app.module.ts`
Ensure `SubscriptionModule` is registered.

---

### Shared Packages

---

#### [MODIFY] `packages/db/schema.prisma`
- Add `SubscriptionPlan` model: `id`, `productId`, `frequency`, `amount`, `razorpayPlanId`, `isActive`.
- Add relation: `Subscription → SubscriptionPlan`.
- Run: `pnpm db:generate && pnpm db:migrate`.

#### [NEW] `packages/types/src/subscription.ts`
`ISubscription`, `ISubscriptionPlan`, `CreateSubscriptionPayload`, `SubscriptionFrequency` types.

#### [MODIFY] `packages/types/src/index.ts`
Re-export subscription types.

---

### Frontend — Storefront (`apps/web`)

---

#### [NEW] `apps/web/src/components/SubscriptionToggle.tsx`
Toggle component: Subscribe (default, teal border, savings badge) vs One-time (plain). Controlled by `isSubscription` state.

#### [NEW] `apps/web/src/components/FrequencySelector.tsx`
Dropdown for frequency selection: Weekly, Fortnightly, Monthly. Updates displayed price.

#### [MODIFY] `apps/web/src/app/products/[id]/page.tsx`
Integrate `SubscriptionToggle` and `FrequencySelector`. Button changes: "Add to Cart" (one-time) vs "Subscribe & Save" (subscription).

#### [MODIFY] `apps/web/src/app/checkout/page.tsx`
Handle subscription checkout: if subscription item, open Razorpay modal with `subscription_id` instead of `order_id`.

---

## Dependencies to Install

| Package | Where | Why |
|---|---|---|
| No new packages required | — | `razorpay` SDK already installed in Week 3. Supports Plans + Subscriptions natively. |

---

## Out of Scope (Week 8+)

- Full subscription FSM (all 9 transitions) → Week 8
- BullMQ renewal job → Week 8
- Dunning sequence → Week 9
- User subscription dashboard (pause, skip, cancel) → Week 10
- Delivery slot selection → Week 11
- Subscription QA + stress testing → Week 12

---

## Verification Plan

### Automated Tests

1. **Subscription service tests** — `apps/api/src/modules/subscription/subscription.service.spec.ts`:
   ```bash
   cd apps/api && pnpm jest --testPathPattern=subscription
   ```
   - Test Plan caching: second call for same product+frequency reuses existing Plan
   - Test `createSubscription()` creates Razorpay Subscription with correct Plan ID
   - Test `createSubscription()` saves `Subscription` record with `status: PENDING`

2. **Webhook test**:
   - Test `subscription.activated` transitions `PENDING → ACTIVE`
   - Test `subscription.activated` creates first delivery order
   - Test idempotency: duplicate `subscription.activated` is no-op

3. **Build check**:
   ```bash
   pnpm turbo run build
   ```

### Browser Verification

4. **Subscription toggle** — `http://localhost:3000/products/[id]`:
   - "Subscribe & Save" is selected by default
   - Shows savings badge ("Save ₹XX" or "Save 10%")
   - Frequency dropdown works (Weekly / Fortnightly / Monthly)
   - Price updates when toggling between subscribe and one-time
   - Toggling to one-time changes button to "Add to Cart"

5. **Subscription checkout** — `http://localhost:3000/checkout`:
   - Razorpay modal opens with "Recurring Mandate" label
   - Shows recurring amount and frequency
   - After mandate authentication → redirect to confirmation page

6. **Razorpay test mode**:
   - Use test card: `4111 1111 1111 1111`
   - Use test UPI: `success@razorpay`
   - Verify mandate shows as "authenticated" in Razorpay dashboard

### Manual Verification

7. **Database** — after successful subscription:
   - `Subscription` record with `status: PENDING` (before webhook)
   - After webhook: `status: ACTIVE` + first `Order` created
   - `SubscriptionPlan` record with `razorpayPlanId`
8. **Razorpay dashboard** — verify subscription shows as `authenticated` / `active`
9. **Webhook logs** — `WebhookEvent` record for `subscription.activated` with `processedAt` set

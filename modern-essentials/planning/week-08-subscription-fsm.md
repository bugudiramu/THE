# Week 8: Subscription State Machine (FSM) & Renewal Engine

> **Blueprint Ref:** §6.3 (Subscription State Machine — all 9 transitions), §6.4 (Webhook Catalogue — `subscription.charged`, `subscription.payment_failed`), §5.2 (Jobs: `subscription-renewal.job.ts`), §15.2 (Never Let AI Write: Subscription FSM), §16 (Technical Debt Traps), §13 Phase 2 Week 8
> **Sprint Goal:** The subscription engine handles all 9 state transitions via a rigorous FSM, a BullMQ renewal job fires on `next_billing_at`, and successful renewals auto-generate delivery orders — all with explicit unit tests for every legal and illegal transition.

---

## Current State (End of Week 7)

| Area | Status |
|---|---|
| Subscriptions | Razorpay Subscription creation works. `PENDING → ACTIVE` transition via `subscription.activated` webhook. |
| Subscription FSM | Only 1 of 9 transitions implemented (`PENDING → ACTIVE`). No pause, cancel, dunning, or renewal logic. |
| BullMQ | Notification queue running. **No subscription renewal job or dunning job**. |
| Webhooks | `subscription.activated` handled. **No handlers for `subscription.charged`, `subscription.payment_failed`, `subscription.cancelled`, `subscription.paused`**. |
| Order generation | First delivery order created on activation. **No renewal order generation**. |
| Price sync | **No mechanism** to update subscription prices when product prices change. |

---

## Objectives

1. Implement the **complete 9-transition FSM** in `SubscriptionService.transitionStatus()` with strict validation.
2. Build the **BullMQ subscription renewal job** — fires daily, finds subscriptions where `nextBillingAt <= now()`.
3. Handle **renewal webhooks** — `subscription.charged` creates renewal orders; `subscription.payment_failed` triggers dunning.
4. Implement **renewal order generation** — auto-creates `Order` with `type: SUBSCRIPTION_RENEWAL` on successful renewal.
5. Write **exhaustive unit tests** for every legal and illegal FSM transition (per §15.2 — hand-write, never AI).

---

## Key Deliverables

### Deliverable 1 — Complete FSM Implementation

All 9 transitions from §6.3, implemented in `SubscriptionService.transitionStatus()`:

| # | From | To | Trigger | Side Effects |
|---|---|---|---|---|
| 1 | `PENDING` | `ACTIVE` | `subscription.activated` webhook | Create first delivery order. Send welcome WhatsApp. Set `nextBillingAt`. |
| 2 | `ACTIVE` | `RENEWAL_DUE` | BullMQ job on `nextBillingAt` | Charge via Razorpay. Wait for webhook response. |
| 3 | `RENEWAL_DUE` | `ACTIVE` | `subscription.charged` webhook | Create renewal order. Update `nextBillingAt`. Send "renewed" WhatsApp. |
| 4 | `RENEWAL_DUE` | `DUNNING` | `subscription.payment_failed` webhook | Log attempt 1. Queue dunning retry in 24h via BullMQ. |
| 5 | `DUNNING` | `ACTIVE` | `subscription.charged` (retry success) | Resume delivery. Send recovery WhatsApp. |
| 6 | `DUNNING` | `CANCELLED` | Dunning job (attempt 3 exhausted) | Cancel Razorpay sub. Send final email + reactivation link. |
| 7 | `ACTIVE` | `PAUSED` | User action (dashboard) | Set `pauseUntil` date. Suspend BullMQ billing job. |
| 8 | `PAUSED` | `ACTIVE` | User resumes OR `pauseUntil` date passed | Re-queue BullMQ billing job. Send resume confirmation. |
| 9 | `ACTIVE` | `CANCELLED` | User cancels (after save flow) | Cancel Razorpay sub. Log cancellation reason. |

**Validation rules:**
- All transitions MUST be validated against a `VALID_TRANSITIONS` map.
- Illegal transitions (e.g., `PENDING → DELIVERED`) throw `BadRequestException`.
- Only the Subscription service executes transitions — controllers NEVER modify status directly (per §6.3).

```typescript
const VALID_TRANSITIONS: Record<SubscriptionStatus, SubscriptionStatus[]> = {
  PENDING: ['ACTIVE'],
  ACTIVE: ['RENEWAL_DUE', 'PAUSED', 'CANCELLED'],
  RENEWAL_DUE: ['ACTIVE', 'DUNNING'],
  DUNNING: ['ACTIVE', 'CANCELLED'],
  PAUSED: ['ACTIVE'],
  CANCELLED: [],
};
```

### Deliverable 2 — BullMQ Subscription Renewal Job

| Item | Detail |
|---|---|
| `subscription-renewal.job.ts` | BullMQ worker. Runs on a scheduled cron (daily at 00:01). |
| Query | Find all `Subscription` where `status = 'ACTIVE'` AND `nextBillingAt <= now()`. |
| Action | For each: transition to `RENEWAL_DUE`. Razorpay auto-charges the mandate. |
| Concurrency | Process max 10 concurrent jobs to avoid overwhelming Razorpay API. |
| Retry | 3 retries with exponential backoff on queue-level failures. |
| Logging | Use NestJS Logger. Log subscription ID, user ID, amount for each processed sub. |

### Deliverable 3 — Renewal Webhook Handlers

| Event | Handler Action |
|---|---|
| `subscription.charged` | 1. Idempotency check. 2. Find subscription by `razorpaySubId`. 3. Transition `RENEWAL_DUE → ACTIVE`. 4. Create renewal `Order` with `type: SUBSCRIPTION_RENEWAL`. 5. Update `nextBillingAt` (current + frequency interval). 6. Send "renewal confirmed" notification. |
| `subscription.payment_failed` | 1. Idempotency check. 2. Transition `RENEWAL_DUE → DUNNING`. 3. Log failure attempt count. 4. Queue dunning retry via BullMQ (placeholder — full dunning in Week 9). |
| `subscription.cancelled` | 1. Transition to `CANCELLED`. 2. Log reason from Razorpay payload. 3. Send cancellation notification. |
| `subscription.paused` | 1. Transition to `PAUSED` (Razorpay-initiated pause). |

### Deliverable 4 — Renewal Order Generation

| Item | Detail |
|---|---|
| Order type | `type: SUBSCRIPTION_RENEWAL` (distinct from `ONE_TIME`). |
| Order items | Copy from subscription's product + quantity. Use current product price (not original sub price). |
| FEFO | Renewal orders are immediately visible in the pick list (FEFO sorted). |
| Order status | Created as `PAID` (payment already captured by Razorpay mandate). |
| Linking | `Order.subscriptionId` links back to the parent subscription. |

### Deliverable 5 — Price Sync Strategy

| Strategy | Detail |
|---|---|
| On product price change | If master `Product.subPrice` changes, existing subscriptions continue at their original price until next renewal. |
| On renewal | Renewal order uses the current `Product.price` at time of renewal (not the price at subscription creation). |
| Admin override | Future: admin can force-update subscription prices (Week 10). |

---

## Proposed Changes

### Backend — NestJS API

---

#### [MODIFY] `apps/api/src/modules/subscription/subscription.service.ts`
Major rewrite:
- `transitionStatus(subId, newStatus, metadata?)` — validates against `VALID_TRANSITIONS`, executes side effects, logs transition.
- `handleRenewal(sub)` — transitions to `RENEWAL_DUE`, lets Razorpay auto-charge.
- `createRenewalOrder(sub)` — creates `Order` + `OrderItem` with `type: SUBSCRIPTION_RENEWAL`.
- `calculateNextBillingDate(current, frequency)` — adds weekly/fortnightly/monthly interval.

#### [NEW] `apps/api/src/jobs/subscription-renewal.job.ts`
BullMQ worker. Cron-scheduled daily. Processes subscriptions due for renewal.

#### [MODIFY] `apps/api/src/modules/webhooks/webhooks.service.ts`
Add handlers for:
- `subscription.charged` → renewal order generation
- `subscription.payment_failed` → dunning initiation
- `subscription.cancelled` → status transition
- `subscription.paused` → status transition

#### [MODIFY] `apps/api/src/app.module.ts`
Register BullMQ queue: `subscription-renewal`. Register the job processor.

---

### Shared Packages

---

#### [MODIFY] `packages/db/schema.prisma`
- Add `pauseUntil: DateTime?` to `Subscription` model.
- Add `dunningAttempt: Int @default(0)` to `Subscription` model.
- Add `cancelReason: String?` to `Subscription` model.
- Run: `pnpm db:generate && pnpm db:migrate`.

#### [MODIFY] `packages/types/src/subscription.ts`
Add `SubscriptionTransition`, `VALID_TRANSITIONS` map, `RenewalJobPayload` types.

---

## Dependencies to Install

| Package | Where | Why |
|---|---|---|
| No new packages required | — | BullMQ + Redis already configured in Week 4. |

---

## Out of Scope (Week 9+)

- Full dunning sequence (3 retries over 7 days) → Week 9
- User subscription self-service dashboard → Week 10
- Delivery slot management → Week 11
- Subscription stress testing → Week 12
- Admin subscription override view → Week 10

---

## Verification Plan

### Automated Tests

> [!IMPORTANT]
> Per §15.2: "Subscription FSM transition logic — a wrong transition = double billing or missed renewal." Write these tests yourself. Do not rely on AI generation.

1. **FSM transition tests** — `apps/api/src/modules/subscription/subscription.service.spec.ts`:
   ```bash
   cd apps/api && pnpm jest --testPathPattern=subscription
   ```
   **Legal transitions (9 tests):**
   - Test `PENDING → ACTIVE` creates first order + sets `nextBillingAt`
   - Test `ACTIVE → RENEWAL_DUE` triggered by renewal job
   - Test `RENEWAL_DUE → ACTIVE` creates renewal order + updates `nextBillingAt`
   - Test `RENEWAL_DUE → DUNNING` logs attempt count
   - Test `DUNNING → ACTIVE` resumes delivery
   - Test `DUNNING → CANCELLED` cancels Razorpay sub
   - Test `ACTIVE → PAUSED` sets `pauseUntil`
   - Test `PAUSED → ACTIVE` re-queues billing job
   - Test `ACTIVE → CANCELLED` cancels Razorpay sub + logs reason

   **Illegal transitions (at minimum 5 tests):**
   - Test `PENDING → CANCELLED` throws `BadRequestException`
   - Test `PENDING → PAUSED` throws `BadRequestException`
   - Test `CANCELLED → ACTIVE` throws `BadRequestException`
   - Test `PAUSED → CANCELLED` throws `BadRequestException`
   - Test `DUNNING → PAUSED` throws `BadRequestException`

2. **Renewal job tests** — `apps/api/src/jobs/subscription-renewal.job.spec.ts`:
   ```bash
   cd apps/api && pnpm jest --testPathPattern=renewal
   ```
   - Test job picks up subscriptions where `nextBillingAt <= now()`
   - Test job skips `PAUSED` and `CANCELLED` subscriptions
   - Test job transitions to `RENEWAL_DUE`

3. **Idempotency tests**:
   - Test `subscription.charged` only creates ONE renewal order even on retry
   - Test duplicate webhook events are skipped

4. **Build check**:
   ```bash
   pnpm turbo run build
   ```

### Manual Verification

5. **Full lifecycle test** (in Razorpay test mode):
   - Create subscription → status `PENDING`
   - Simulate `subscription.activated` → status `ACTIVE`, first order created
   - Simulate `subscription.charged` → renewal order created, `nextBillingAt` updated
   - Simulate `subscription.payment_failed` → status `DUNNING`
   - Verify all transitions logged in database

6. **BullMQ dashboard** — verify renewal jobs are processed:
   - Check Redis for completed jobs in the `subscription-renewal` queue
   - Confirm no stuck/failed jobs

# Week 9: Dunning Sequence & Automated Payment Recovery

> **Blueprint Ref:** §6.3 (FSM: `RENEWAL_DUE → DUNNING`, `DUNNING → ACTIVE`, `DUNNING → CANCELLED`), §6.4 (Webhook: `subscription.payment_failed`), §9.3 (Dunning Sequence — 4 attempts over 8 days), §5.2 (Jobs: `dunning.job.ts`), §13 Phase 2 Week 9
> **Sprint Goal:** Failed subscription payments trigger a fully automated 3-retry dunning sequence over 7 days with WhatsApp + email escalation at each stage, auto-cancelling on Day 8 — with zero human intervention required.

---

## Current State (End of Week 8)

| Area | Status |
|---|---|
| Subscription FSM | All 9 transitions implemented. `VALID_TRANSITIONS` enforced. |
| Renewal job | BullMQ daily job processes `ACTIVE` subs where `nextBillingAt <= now()`. |
| Dunning | `RENEWAL_DUE → DUNNING` transition exists but **no retry logic, no scheduled retries, no escalation messages**. |
| Notifications | Mocked email + WhatsApp adapters. Templates for order lifecycle only. **No dunning-specific templates.** |
| Auto-cancel | `DUNNING → CANCELLED` transition exists but **not triggered automatically**. |

---

## Objectives

1. Build the **BullMQ dunning job** — schedules retries at Day 1, Day 3, and Day 7 after initial failure.
2. Create **dunning notification templates** — escalating urgency at each retry stage.
3. Implement **automatic cancellation** on Day 8 if all retries exhausted.
4. Build **admin visibility** — dunning subscriptions visible in ops dashboard.
5. Add **reactivation link** in final cancellation email for easy re-subscription.

---

## Key Deliverables

### Deliverable 1 — Dunning Schedule (per §9.3)

| Attempt | When | Channel | Message | Action |
|---|---|---|---|---|
| Attempt 1 | Day 0 (billing day) | Auto-charge via Razorpay | — | Razorpay auto-charges mandate. If fails → `payment_failed` webhook. |
| Retry 1 | Day 1 | WhatsApp + Email | "Payment failed. Tap here to update your payment method." | BullMQ job. Trigger Razorpay retry. |
| Retry 2 | Day 3 | WhatsApp + Push | "Your delivery is on hold. Renew now to continue receiving eggs." | BullMQ job. Trigger Razorpay retry. |
| Retry 3 | Day 7 | WhatsApp + Email | "Final notice. Subscription will be cancelled tomorrow." | BullMQ job. Last chance. |
| Auto-cancel | Day 8 | System action | — | Transition `DUNNING → CANCELLED`. Send final email with reactivation link. |

### Deliverable 2 — BullMQ Dunning Job

| Item | Detail |
|---|---|
| `dunning.job.ts` | BullMQ worker for the `dunning` queue. |
| Job scheduling | On `subscription.payment_failed`: schedule 3 delayed jobs at +1d, +3d, +7d intervals. |
| Job payload | `{ subscriptionId, attempt: 1|2|3, userId, razorpaySubId }` |
| Retry logic | Each job: check if already resolved (sub status = `ACTIVE`). If not, trigger Razorpay charge retry + send escalation notification. |
| Auto-cancel job | 4th job at Day 8: if still `DUNNING`, transition to `CANCELLED`. |
| Idempotency | If subscription already recovered (via manual payment or webhook), skip the retry. |

### Deliverable 3 — Dunning Notification Templates

| Template | Channel | Urgency | Content |
|---|---|---|---|
| `dunning-retry1.tsx` | Email | Low | "Your payment didn't go through. Update your payment method to keep your subscription active." |
| `dunning-retry1-wa` | WhatsApp | Low | "Payment failed for your Modern Essentials subscription. Tap to update: [link]" |
| `dunning-retry2-wa` | WhatsApp | Medium | "Your egg delivery is on hold! Renew now to continue receiving fresh eggs: [link]" |
| `dunning-retry3.tsx` | Email | High | "Final notice: your subscription will be cancelled tomorrow. Act now: [link]" |
| `dunning-retry3-wa` | WhatsApp | High | "LAST CHANCE: Your Modern Essentials subscription expires tomorrow. Renew: [link]" |
| `subscription-cancelled.tsx` | Email | Final | "Your subscription has been cancelled. We'd love to have you back: [reactivation link]" |

### Deliverable 4 — Admin Dunning Visibility

| View | Detail |
|---|---|
| Dashboard card | "Dunning" count card on admin home showing subscriptions currently in dunning. |
| Subscription filter | Add `DUNNING` filter to subscription overrides view. Shows: user, product, attempt count, days in dunning. |

### Deliverable 5 — Reactivation Flow

| Item | Detail |
|---|---|
| Reactivation link | URL in cancellation email: `/reactivate?subId=...&token=...`. |
| Reactivation page | Storefront page showing: "Welcome back! Reactivate your subscription with one click." |
| Backend endpoint | `POST /subscriptions/:id/reactivate` — creates a new Razorpay subscription for the same product/frequency. |

---

## Proposed Changes

### Backend — NestJS API

---

#### [NEW] `apps/api/src/jobs/dunning.job.ts`
BullMQ worker for `dunning` queue. Processes retry attempts. Checks if subscription already recovered. Triggers Razorpay charge retry or cancellation.

#### [MODIFY] `apps/api/src/modules/subscription/subscription.service.ts`
- `initiateDunning(subId)` — schedules 3 delayed BullMQ jobs + final auto-cancel job.
- `processDunningAttempt(subId, attempt)` — retry charge, send escalation notification, increment `dunningAttempt`.
- `autoCancel(subId)` — transition `DUNNING → CANCELLED`, cancel Razorpay sub, send final email.
- `reactivate(subId, userId)` — create new Razorpay subscription from cancelled sub's details.

#### [MODIFY] `apps/api/src/modules/webhooks/webhooks.service.ts`
On `subscription.payment_failed`:
- Check if already in `DUNNING` (may be a retry failure).
- If first failure: transition `RENEWAL_DUE → DUNNING` + call `initiateDunning()`.
- If already dunning: update attempt count.

#### [NEW] `apps/api/src/modules/subscription/subscription.controller.ts` (new endpoint)
`POST /subscriptions/:id/reactivate` — guarded, creates new subscription.

#### [MODIFY] `apps/api/src/app.module.ts`
Register BullMQ queue: `dunning`.

---

### Shared Packages

---

#### [MODIFY] `packages/db/schema.prisma`
- Add `dunningStartedAt: DateTime?` to `Subscription`.
- Run: `pnpm db:generate && pnpm db:migrate`.

#### [NEW] `packages/email/emails/dunning-retry1.tsx`
Dunning email template — low urgency.

#### [NEW] `packages/email/emails/dunning-retry3.tsx`
Dunning email template — high urgency, final notice.

#### [NEW] `packages/email/emails/subscription-cancelled.tsx`
Cancellation email with reactivation link.

---

### Frontend — Storefront (`apps/web`)

---

#### [NEW] `apps/web/src/app/reactivate/page.tsx`
Reactivation landing page. Shows previous subscription details + "Reactivate" button.

---

### Frontend — Admin Dashboard (`apps/admin`)

---

#### [MODIFY] `apps/admin/src/app/page.tsx`
Add "Dunning" count card to dashboard home.

---

## Dependencies to Install

| Package | Where | Why |
|---|---|---|
| No new packages required | — | BullMQ, notification adapters already configured. |

---

## Out of Scope (Week 10+)

- User subscription self-service dashboard → Week 10
- Delivery slot management → Week 11
- Subscription QA + load testing → Week 12
- Live WhatsApp API calls (Interakt) → when API key available

---

## Verification Plan

### Automated Tests

> [!IMPORTANT]
> Per §15.2: Dunning logic is revenue-critical. Write these tests manually with explicit edge cases.

1. **Dunning service tests** — `apps/api/src/modules/subscription/dunning.spec.ts`:
   ```bash
   cd apps/api && pnpm jest --testPathPattern=dunning
   ```
   - Test `initiateDunning()` schedules exactly 4 delayed jobs (3 retries + 1 auto-cancel)
   - Test `processDunningAttempt(1)` sends retry1 notification
   - Test `processDunningAttempt(2)` sends retry2 notification
   - Test `processDunningAttempt(3)` sends retry3 (final notice) notification
   - Test `autoCancel()` transitions to `CANCELLED` + cancels Razorpay sub
   - Test skips retry if subscription already `ACTIVE` (recovered via webhook)
   - Test skips retry if subscription already `CANCELLED`

2. **Webhook integration tests**:
   - Test `subscription.payment_failed` initiates dunning on first failure
   - Test `subscription.payment_failed` during dunning updates attempt count
   - Test `subscription.charged` during dunning recovers to `ACTIVE`

3. **Build check**:
   ```bash
   pnpm turbo run build
   ```

### Manual Verification

4. **Full dunning lifecycle** (Razorpay test mode):
   - Create subscription → `ACTIVE`
   - Simulate `subscription.payment_failed` → `DUNNING`
   - Check BullMQ: 4 delayed jobs scheduled
   - Fast-forward Day 1 job → retry notification sent (check logs)
   - Simulate recovery (`subscription.charged`) → `ACTIVE`, remaining jobs skipped
   - Alternate: let all retries fail → auto-cancel on Day 8

5. **Admin dashboard** — verify dunning count card shows correct number
6. **Reactivation flow** — click reactivation link → re-subscribe successfully

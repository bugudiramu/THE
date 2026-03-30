# Week 15: Points Redemption at Checkout & Expiry Logic

> **Blueprint Ref:** §10.1 (Ledger Architecture — Redemption: Min 100 points = ₹10, Expiry: 12 months inactive), §9.3 (Dunning-style expiry warning), §13 Phase 3 Week 15
> **Sprint Goal:** Customers can apply loyalty points at checkout with a minimum threshold of 100 points (= ₹10 discount), and the system warns subscribers 30 days before points expire due to inactivity — with all deductions recorded as immutable negative ledger entries.

---

## Current State (End of Week 14)

| Area | Status |
|---|---|
| Rewards ledger | Append-only ledger working. Points earned on delivered orders (10/₹100 sub, 5/₹100 one-time). |
| Balance | `SUM(amount)` computation. User-facing balance display + history. |
| Milestones | 3-month (+300) and 6-month (+600) milestone rewards. BullMQ job. |
| Redemption | **Not implemented**. No way to use points at checkout. |
| Expiry | **Not implemented**. Points never expire. No inactivity tracking. |
| Checkout | One-time + subscription checkout working. **No points application step**. |

---

## Objectives

1. Build **points redemption at checkout** — apply points as discount, minimum 100 points = ₹10.
2. Implement **points expiry logic** — expire points after 12 months of inactivity.
3. Send **30-day expiry warning** via WhatsApp before points expire.
4. Update the **checkout UI** with a rewards application step.
5. Update the **rewards dashboard** with expiry countdown and redemption history.

---

## Key Deliverables

### Deliverable 1 — Checkout Points Redemption

| Rule | Detail |
|---|---|
| Minimum | 100 points minimum to redeem. |
| Conversion | 100 points = ₹10 discount. (1 point = ₹0.10) |
| Maximum | Cannot exceed order total. Points cover up to 100% of order value. |
| Partial | User can choose how many points to apply (slider or input). |
| Ledger entry | Negative entry: `type: REDEMPTION`, `amount: -N`, `refId: orderId`. |
| Atomicity | Points deduction and order creation in the same `prisma.$transaction`. |
| Post-redemption | If order is cancelled/refunded, points are re-credited (+N entry with `type: EARN_REFUND`). |

**Redemption flow:**
1. User reaches checkout page.
2. If `balance >= 100`, show rewards application panel.
3. User selects points to apply (slider: 0 → min(balance, orderTotal * 10)).
4. Order total updates in real-time: `discountedTotal = total - (pointsApplied / 10)`.
5. On payment: deduct points via `ledger.appendEntry()` in same transaction as order creation.

### Deliverable 2 — Points Expiry Logic

| Rule | Detail |
|---|---|
| Trigger | 12 months of inactivity (no order placed, no subscription active). |
| Warning | 30 days before expiry: WhatsApp + email notification with points balance. |
| Expiry action | BullMQ job: expire all points by appending `type: EXPIRY`, `amount: -balance`. |
| Re-activation | If user places an order during the 30-day warning period, reset the inactivity clock. |

**Inactivity detection:**
- Check user's last earning entry date (`MAX(createdAt) FROM ledger_entries WHERE type LIKE 'EARN_%'`).
- If > 335 days ago (12 months - 30 day warning): send warning.
- If > 365 days ago: expire all points.

### Deliverable 3 — Checkout UI Updates

| Component | Detail |
|---|---|
| `RewardsApply.tsx` | Panel in checkout: "You have X points (₹Y value). Apply?" Slider for point amount. Real-time total update. |
| Checkout page | Insert rewards step between order summary and payment. |
| Confirmation page | Show points redeemed as line item in order summary. |

### Deliverable 4 — Expiry Warning Notifications

| Template | Channel | Content |
|---|---|---|
| `points-expiry-warning.tsx` | Email | "Your 2,450 points (₹245 value) will expire in 30 days. Place an order to keep them active!" |
| `points-expiry-wa` | WhatsApp | "Your Modern Essentials points expire soon! You have ₹245 in rewards. Shop now: [link]" |
| `points-expired.tsx` | Email | "Your points have expired. Start earning again with your next order." |

### Deliverable 5 — Rewards Dashboard Updates

| Update | Detail |
|---|---|
| Expiry warning | If points are approaching expiry, show countdown: "Your points expire in X days". |
| Redemption history | Filter earning history by `REDEMPTION` type. Show "Used at checkout" entries. |
| Refund entries | Show "Points refunded" entries for cancelled orders. |

---

## Proposed Changes

### Backend — NestJS API

---

#### [MODIFY] `apps/api/src/modules/ledger/ledger.service.ts`
- `applyRedemption(userId, orderId, points)` — validates balance ≥ points, appends negative entry.
- `refundRedemption(userId, orderId)` — re-credits points from cancelled/refunded order.
- `checkExpiry(userId)` — checks inactivity and returns days until expiry.

#### [NEW] `apps/api/src/jobs/points-expiry.job.ts`
BullMQ job (runs daily): checks all users for 30-day warning and 365-day expiry.

#### [MODIFY] `apps/api/src/modules/checkout/checkout.service.ts`
In `verifyPayment()`: if points applied, call `ledger.applyRedemption()` in the same transaction.

#### [MODIFY] `apps/api/src/modules/orders/orders.service.ts`
On `→ REFUNDED` or `→ CANCELLED`: if order had points redeemed, call `ledger.refundRedemption()`.

#### [MODIFY] `apps/api/src/app.module.ts`
Register `points-expiry` BullMQ queue.

---

### Shared Packages

---

#### [MODIFY] `packages/db/schema.prisma`
- Add `pointsRedeemed: Int @default(0)` to `Order` model.
- Add `EARN_REFUND` to `LedgerType` enum.
- Run: `pnpm db:generate && pnpm db:migrate`.

#### [NEW] `packages/email/emails/points-expiry-warning.tsx`
Expiry warning email template.

#### [NEW] `packages/email/emails/points-expired.tsx`
Points expired notification template.

---

### Frontend — Storefront (`apps/web`)

---

#### [NEW] `apps/web/src/components/checkout/RewardsApply.tsx`
Points application panel with slider, balance display, and real-time total update.

#### [MODIFY] `apps/web/src/app/checkout/page.tsx`
Insert `RewardsApply` component between order summary and payment button.

#### [MODIFY] `apps/web/src/app/order-confirmation/page.tsx`
Show "Points redeemed: -X pts (₹Y)" as order line item if applicable.

#### [MODIFY] `apps/web/src/app/account/rewards/page.tsx`
Add expiry warning card and redemption history filter.

---

## Dependencies to Install

| Package | Where | Why |
|---|---|---|
| No new packages required | — | All infrastructure already in place. |

---

## Out of Scope (Week 16+)

- Referral system with codes → Week 16
- Sanity CMS + farm stories → Week 17-18
- Metabase BI → Week 19
- PostHog funnels → Week 20

---

## Verification Plan

### Automated Tests

1. **Redemption tests** — `apps/api/src/modules/ledger/ledger.service.spec.ts`:
   ```bash
   cd apps/api && pnpm jest --testPathPattern=ledger
   ```
   - Test `applyRedemption()` creates negative ledger entry
   - Test `applyRedemption()` rejects if balance < 100 points
   - Test `applyRedemption()` rejects if points > balance
   - Test `refundRedemption()` re-credits correct amount
   - Test redemption + order creation are atomic (both succeed or both fail)

2. **Expiry tests**:
   - Test 30-day warning triggers for user inactive > 335 days
   - Test expiry creates negative entry equaling full balance
   - Test placing an order resets inactivity clock

3. **Build check**:
   ```bash
   pnpm turbo run build
   ```

### Browser Verification

4. **Checkout redemption** — `http://localhost:3000/checkout`:
   - Points panel appears if balance ≥ 100
   - Slider adjusts discount
   - Total updates in real-time
   - After payment: points deducted from balance

5. **Rewards dashboard** — `http://localhost:3000/account/rewards`:
   - Redemption entries show in history
   - Expiry warning displays when applicable

### Manual Verification

6. **Audit trail**: Verify redemptions are negative ledger entries, never `UPDATE` queries
7. **Refund flow**: Cancel an order with redeemed points → verify points re-credited

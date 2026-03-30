# Weeks 13-14: Rewards Ledger & Loyalty Engine

> **Blueprint Ref:** §10.1 (Ledger Architecture — append-only, NEVER update), §10.2 (Referral System), §6.1 (Module Ownership — Ledger), §6.2 (ledger_entries table), §15.2 (Never Let AI Write: Rewards ledger append logic), §16 (Technical Debt Trap: Mutable rewards balance), §13 Phase 3 Weeks 13-14
> **Sprint Goal:** Customers earn loyalty points on every order (10pts/₹100 for subscriptions, 5pts/₹100 for one-time), milestone rewards trigger at 3-month and 6-month streaks, and the balance is always computed from `SUM(amount)` on the immutable ledger — never stored as a mutable field.

---

## Current State (End of Week 12)

| Area | Status |
|---|---|
| Schema | `LedgerEntry` model exists: `id`, `userId`, `type`, `amount`, `refId`, `refType`, `createdAt`. |
| Ledger API | **None**. No ledger module. No points earning or balance queries. |
| Rewards UI | **None**. No balance display, no earning history, no redemption. |
| Referrals | **None**. No referral codes, no referral tracking. |
| Milestones | **None**. No streak tracking or milestone rewards. |

---

## Objectives

1. Build the **NestJS ledger module** — append-only ledger with earning, milestone, and balance computation.
2. Wire **automatic point earning** into the order lifecycle (on `DELIVERED` status).
3. Implement **milestone rewards** — 3-month and 6-month active subscriber bonuses.
4. Build the **rewards dashboard UI** on the storefront — balance, earning history, tier progress.
5. Lay the foundation for redemption at checkout (implementation in Week 15).

---

## Key Deliverables

### Deliverable 1 — Ledger Architecture (per §10.1)

> [!IMPORTANT]
> The rewards balance is NEVER stored as a mutable number on the user row. NEVER `UPDATE users SET points = points + N`. Every point event is an immutable append to `ledger_entries`. Balance = `SELECT SUM(amount) FROM ledger_entries WHERE user_id = ?`.

| Earning Event | Points | Notes |
|---|---|---|
| Subscription order delivered | +10 per ₹100 spent | Core earning. Triggered on `Order.status → DELIVERED`. |
| One-time order delivered | +5 per ₹100 spent | Lower rate to incentivize subscription. |
| Milestone: 3 months active subscriber | +300 | BullMQ job checks subscription age monthly. |
| Milestone: 6 months active subscriber | +600 | Same BullMQ job. |
| Referral: referred user's first order | +200 | Credited when referral's first order is delivered (§10.2). |
| Referral: referred user subscribes + renews | +500 bonus | Credited on referral's first subscription renewal. |
| Redemption at checkout | –N | Min 100 points = ₹10. Deducted as negative entry. (Week 15) |
| Expiry (12 months inactive) | –N (expiry) | Warn 30 days before via WhatsApp. (Week 15) |

**Ledger entry structure:**
```typescript
{
  id: string;           // UUID
  userId: string;       // FK to User
  type: LedgerType;     // EARN_ORDER | EARN_REFERRAL | EARN_MILESTONE | REDEMPTION | EXPIRY
  amount: number;       // Positive for earning, negative for deduction
  refId: string;        // Reference: orderId, referralId, milestoneId
  refType: string;      // 'order' | 'referral' | 'milestone'
  createdAt: DateTime;  // Immutable timestamp
}
```

### Deliverable 2 — NestJS Ledger Module

| Endpoint | Method | Purpose |
|---|---|---|
| `GET /rewards/balance` | GET | Current user's point balance (`SUM(amount)`). |
| `GET /rewards/history` | GET | Paginated ledger entry history for current user. |
| `GET /rewards/tier` | GET | Current tier (Bronze/Silver/Gold) based on total lifetime earnings. |

| Item | Detail |
|---|---|
| `ledger.module.ts` | Imports `PrismaModule`. |
| `ledger.controller.ts` | User-facing endpoints, guarded by `ClerkAuthGuard`. |
| `ledger.service.ts` | `getBalance(userId)`, `getHistory(userId, page)`, `appendEntry(payload)`, `calculateTier(userId)`. |
| `ledger.dto.ts` | `LedgerEntryDto`, `BalanceResponseDto`, `TierResponseDto`. |

**Critical rules for `appendEntry()`:**
- ONLY appends. Never updates or deletes existing entries.
- Every append is wrapped in a `prisma.$transaction` for atomicity.
- Validates `amount > 0` for earning types, `amount < 0` for deduction types.
- Duplicate prevention: check for existing entry with same `refId + refType + type`.

### Deliverable 3 — Automatic Point Earning

Hook into order lifecycle:

| Trigger | Service Call | Detail |
|---|---|---|
| `Order.status → DELIVERED` | `ledger.appendEntry()` | Calculate points: `Math.floor(order.total / 10000) * pointRate`. Rate depends on `order.type`. |
| Subscription renewal delivered | Same | Uses subscription rate (10pts/₹100). |
| One-time order delivered | Same | Uses one-time rate (5pts/₹100). |

Wire in `OrdersService.transitionStatus()` — when transitioning to `DELIVERED`, call `LedgerService.earenOrderPoints(orderId)`.

### Deliverable 4 — Milestone Rewards

| Item | Detail |
|---|---|
| BullMQ job | `milestone-check.job.ts` — runs monthly. Checks all active subscribers for 3-month and 6-month streak. |
| 3-month milestone | Subscription `createdAt` ≥ 90 days ago AND status is `ACTIVE`. Append +300 points. |
| 6-month milestone | Subscription `createdAt` ≥ 180 days ago AND status is `ACTIVE`. Append +600 points. |
| Idempotency | Check if milestone already awarded (existing ledger entry with `refType: 'milestone'` + `refId: 'milestone_3m_subId'`). |
| Notification | Send "Congratulations!" WhatsApp on milestone. |

### Deliverable 5 — Rewards Dashboard UI

| Page | Route | Detail |
|---|---|---|
| Rewards hub | `/account/rewards` | Balance card (large), tier badge, earning history table, tier progress bar. |

| Component | Detail |
|---|---|
| `RewardsBalance.tsx` | Large balance display: "You have 2,450 points (₹245 value)". |
| `TierBadge.tsx` | Bronze (0-999), Silver (1000-4999), Gold (5000+). Icon + label. |
| `TierProgressBar.tsx` | Progress bar showing points toward next tier. |
| `EarningHistory.tsx` | Table: Date, Type, Description, Points (+/-), Running Balance. Paginated. |

---

## Proposed Changes

### Backend — NestJS API

---

#### [NEW] `apps/api/src/modules/ledger/ledger.module.ts`
Ledger module. Imports `PrismaModule`.

#### [NEW] `apps/api/src/modules/ledger/ledger.controller.ts`
User-facing: `GET /rewards/balance`, `GET /rewards/history`, `GET /rewards/tier`.

#### [NEW] `apps/api/src/modules/ledger/ledger.service.ts`
`getBalance()`, `getHistory()`, `appendEntry()`, `calculateTier()`, `earnOrderPoints()`.

#### [NEW] `apps/api/src/modules/ledger/ledger.dto.ts`
`LedgerEntryDto`, `AppendEntryDto`, `BalanceResponseDto`.

#### [NEW] `apps/api/src/jobs/milestone-check.job.ts`
Monthly BullMQ job: checks active subscribers for 3/6 month milestones.

#### [MODIFY] `apps/api/src/modules/orders/orders.service.ts`
On `→ DELIVERED` transition: call `LedgerService.earnOrderPoints(orderId)`.

#### [MODIFY] `apps/api/src/app.module.ts`
Register `LedgerModule`. Register `milestone-check` BullMQ queue.

---

### Shared Packages

---

#### [MODIFY] `packages/db/schema.prisma`
- Add `LedgerType` enum: `EARN_ORDER`, `EARN_REFERRAL`, `EARN_MILESTONE`, `REDEMPTION`, `EXPIRY`.
- Update `LedgerEntry` model with `type: LedgerType` enum.
- Add index on `(userId, createdAt)` for efficient history queries.
- Add index on `(userId, refId, refType, type)` for duplicate prevention.
- Run: `pnpm db:generate && pnpm db:migrate`.

---

### Frontend — Storefront (`apps/web`)

---

#### [NEW] `apps/web/src/app/account/rewards/page.tsx`
Rewards dashboard: balance, tier, history.

#### [NEW] `apps/web/src/components/rewards/RewardsBalance.tsx`
Large balance display with rupee value conversion.

#### [NEW] `apps/web/src/components/rewards/TierBadge.tsx`
Tier icon + label component.

#### [NEW] `apps/web/src/components/rewards/TierProgressBar.tsx`
Progress bar toward next tier.

#### [NEW] `apps/web/src/components/rewards/EarningHistory.tsx`
Paginated earning history table.

#### [MODIFY] `apps/web/src/components/UserHeader.tsx`
Add "Rewards" link and points balance mini-badge in header.

---

## Dependencies to Install

| Package | Where | Why |
|---|---|---|
| No new packages required | — | All infrastructure already in place. |

---

## Out of Scope (Week 15+)

- Points redemption at checkout → Week 15
- Points expiry logic → Week 15
- Referral system with codes → Week 16
- Sanity CMS → Week 17-18
- Metabase BI dashboards → Week 19

---

## Verification Plan

### Automated Tests

> [!IMPORTANT]
> Per §15.2: "Rewards ledger append logic — any mutation to balances breaks the audit trail permanently." Hand-write these tests.

1. **Ledger service tests** — `apps/api/src/modules/ledger/ledger.service.spec.ts`:
   ```bash
   cd apps/api && pnpm jest --testPathPattern=ledger
   ```
   - Test `getBalance()` returns `SUM(amount)` correctly with mixed positive/negative entries
   - Test `appendEntry()` is truly append-only (no updates to existing entries)
   - Test `appendEntry()` prevents duplicates (same `refId + refType + type`)
   - Test `earnOrderPoints()` calculates correct points (10pts/₹100 for sub, 5pts/₹100 for one-time)
   - Test `calculateTier()` returns correct tier for boundary values (999, 1000, 4999, 5000)

2. **Integration test**: Order lifecycle → ledger entry:
   - Create order → transition to DELIVERED → verify ledger entry created with correct amount

3. **Milestone job test**:
   - Test 3-month milestone awards +300 points
   - Test milestone is not double-awarded (idempotency)
   - Test inactive subscribers don't receive milestones

4. **Build check**:
   ```bash
   pnpm turbo run build
   ```

### Browser Verification

5. **Rewards dashboard** — `http://localhost:3000/account/rewards`:
   - Balance displays correctly
   - Tier badge shows correct tier
   - History table shows earning entries
   - Points earned from delivered orders appear

### Manual Verification

6. **Audit trail**: Verify no `UPDATE` or `DELETE` queries ever touch `ledger_entries` table
7. **Balance accuracy**: Create 10 orders, deliver them, verify balance matches manual calculation

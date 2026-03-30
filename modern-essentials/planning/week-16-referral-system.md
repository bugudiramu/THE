# Week 16: Referral System

> **Blueprint Ref:** §10.2 (Referral System — unique codes, dual-sided rewards), §17.1 (Channel Plan — Referral programme Phase 2), §13 Phase 3 Week 16
> **Sprint Goal:** Every user has a unique referral code, referred users get ₹50 off their first order, referrers earn 200 points on the referred user's first order completion + 500 bonus points on first subscription renewal — all tracked in a `Referral` table with full state management.

---

## Current State (End of Week 15)

| Area | Status |
|---|---|
| Rewards ledger | Fully working: earning, redemption, expiry, milestones. |
| Referrals | **Not implemented**. No referral codes, no tracking, no rewards. |
| User profile | No referral code displayed. No invite mechanism. |

---

## Objectives

1. Generate **unique referral codes** for every user on signup.
2. Build the **referral tracking table** — `referrer_id`, `referred_id`, status, reward timestamps.
3. Implement **dual-sided incentives** — ₹50 off for referred + points for referrer.
4. Build the **referral UI** — share link, track referrals, see pending rewards.
5. Wire referral rewards into the **order lifecycle** (first order delivered + first subscription renewal).

---

## Key Deliverables

### Deliverable 1 — Referral Data Model

| Model | Fields | Purpose |
|---|---|---|
| `Referral` | `id`, `referrerId`, `referredId`, `referralCode`, `status`, `firstOrderAt?`, `firstRenewalAt?`, `referrerRewardedAt?`, `bonusRewardedAt?`, `createdAt` | Full referral lifecycle tracking. |

**Status enum:** `SIGNED_UP`, `FIRST_ORDER`, `SUBSCRIBED`, `COMPLETED` (first renewal done).

**Referral code:** Auto-generated, URL-safe, 8 characters (e.g., `FRESH2K6M`). Stored on `User.referralCode`.

### Deliverable 2 — Referral API

| Endpoint | Method | Purpose |
|---|---|---|
| `GET /referrals/code` | GET | Get current user's referral code + shareable link. |
| `GET /referrals/stats` | GET | Referral stats: total referred, pending rewards, earned rewards. |
| `GET /referrals/list` | GET | List all referrals with status. |
| `POST /referrals/apply` | POST | Apply a referral code during signup/first order. Validates code. |

### Deliverable 3 — Referral Rewards Flow

| Event | Reward | To Whom | Mechanism |
|---|---|---|---|
| Referred user signs up with code | ₹50 discount code | Referred user | Auto-apply coupon to first order. |
| Referred user's first order delivered | +200 points | Referrer | Ledger entry: `type: EARN_REFERRAL`, `refId: referralId`. |
| Referred user's first subscription renewal | +500 bonus points | Referrer | Ledger entry: `type: EARN_REFERRAL`, `refId: referralId_bonus`. |

### Deliverable 4 — Referral UI

| Component | Detail |
|---|---|
| `ReferralCard.tsx` | On rewards page: "Share & Earn" card with referral code, copy button, share links (WhatsApp, email). |
| `ReferralTracker.tsx` | Table: referred user (masked name), status, reward status. |
| Signup form update | Accept optional referral code field during registration. |
| `/invite/[code]` | Landing page: "You've been referred! Sign up for ₹50 off your first order." |

---

## Proposed Changes

### Backend — NestJS API

---

#### [NEW] `apps/api/src/modules/referral/referral.module.ts`
Referral module. Imports `PrismaModule`, `LedgerModule`.

#### [NEW] `apps/api/src/modules/referral/referral.controller.ts`
Referral endpoints. All guarded.

#### [NEW] `apps/api/src/modules/referral/referral.service.ts`
- `generateCode(userId)` — generate unique 8-char code.
- `applyCode(referredUserId, code)` — validate and create `Referral` record.
- `onFirstOrderDelivered(referralId)` — award 200 points to referrer.
- `onFirstRenewal(referralId)` — award 500 bonus points to referrer.

#### [NEW] `apps/api/src/modules/referral/referral.dto.ts`
`ApplyReferralDto { code: string }`.

#### [MODIFY] `apps/api/src/modules/orders/orders.service.ts`
On `→ DELIVERED`: check if this is referred user's first order → trigger referrer reward.

#### [MODIFY] `apps/api/src/modules/subscription/subscription.service.ts`
On successful first renewal: check if referral exists → trigger bonus reward.

#### [MODIFY] `apps/api/src/app.module.ts`
Register `ReferralModule`.

---

### Shared Packages

---

#### [MODIFY] `packages/db/schema.prisma`
- Add `Referral` model with status enum.
- Add `referralCode: String? @unique` to `User`.
- Run: `pnpm db:generate && pnpm db:migrate`.

---

### Frontend — Storefront (`apps/web`)

---

#### [NEW] `apps/web/src/components/referrals/ReferralCard.tsx`
Share card with code, copy button, WhatsApp/email share links.

#### [NEW] `apps/web/src/components/referrals/ReferralTracker.tsx`
Referral status table.

#### [MODIFY] `apps/web/src/app/account/rewards/page.tsx`
Add referral section with `ReferralCard` and `ReferralTracker`.

#### [NEW] `apps/web/src/app/invite/[code]/page.tsx`
Referral landing page with signup CTA.

---

## Dependencies to Install

| Package | Where | Why |
|---|---|---|
| `nanoid` | `apps/api` | Generate URL-safe unique referral codes |

---

## Out of Scope (Week 17+)

- Sanity CMS + farm stories → Week 17-18
- Metabase BI dashboards → Week 19
- PostHog funnels + A/B testing → Week 20
- Advanced referral tiers → Phase 4

---

## Verification Plan

### Automated Tests

1. **Referral service tests**:
   ```bash
   cd apps/api && pnpm jest --testPathPattern=referral
   ```
   - Test code generation is unique
   - Test `applyCode()` validates code exists
   - Test `applyCode()` rejects self-referral
   - Test first order delivers +200 points to referrer
   - Test first renewal delivers +500 bonus to referrer
   - Test rewards are not double-awarded

2. **Build check**:
   ```bash
   pnpm turbo run build
   ```

### Browser Verification

3. **Referral flow**:
   - User A generates code → copies it
   - User B visits `/invite/[code]` → signs up → ₹50 discount applied to cart
   - User B places first order → User A gets +200 points
   - User B subscribes + first renewal completes → User A gets +500 bonus

### Manual Verification

4. **Ledger audit**: Verify referral rewards are immutable ledger entries
5. **WhatsApp share**: Click "Share via WhatsApp" → pre-filled message with invite link

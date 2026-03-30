# Week 12: Subscription QA, End-to-End Testing & Stress Testing

> **Blueprint Ref:** §5.3 (Testing: Jest, Vitest, Playwright), §5.6 (CI/CD Pipeline — E2E tests), §6.3 (All 9 FSM transitions), §6.4 (All webhook events), §7.1 (FEFO compliance), §12.2 (FEFO compliance metric: 0% out-of-order), §15.2 (Hand-write FSM tests), §16 (Webhook idempotency trap), §13 Phase 2 Week 12
> **Sprint Goal:** The entire subscription lifecycle (signup → subscribe → renewal → pause → resume → dunning → cancel) passes end-to-end automated tests, webhook idempotency holds under rapid-fire duplicates, and the renewal job handles 500 concurrent subscriptions without failure.

---

## Current State (End of Week 11)

| Area | Status |
|---|---|
| Subscription FSM | All 9 transitions implemented + unit tested. |
| Dunning | 3-retry sequence with auto-cancel on Day 8. |
| Self-service | All 7 actions: pause, skip, frequency, quantity, address, swap, cancel. |
| Delivery slots | Slot picker in checkout, hub routing, capacity management. |
| End-to-end tests | **None**. No Playwright tests. No integration test covering full lifecycle. |
| Load testing | **Never done**. No stress test on BullMQ renewal job. |
| Webhook stress | **Never done**. Idempotency logic untested under rapid duplicates. |
| FEFO compliance | Pick list sorts by `expiresAt ASC` but **never verified under load**. |

---

## Objectives

1. Write **Playwright E2E tests** covering the complete checkout + subscription flow.
2. Write **integration tests** for the full subscription lifecycle (all 9 FSM transitions).
3. **Load test** the BullMQ renewal job with 500 concurrent subscriptions.
4. **Stress test** webhook idempotency with rapid-fire duplicate events.
5. Verify **FEFO compliance** under load — pick list ordering must never break.

---

## Key Deliverables

### Deliverable 1 — Playwright E2E Tests

| Test Suite | Description |
|---|---|
| `checkout-flow.spec.ts` | Complete one-time purchase: browse → add to cart → checkout → pay → confirmation. |
| `subscription-flow.spec.ts` | Subscribe: browse → select "Subscribe & Save" → choose frequency → checkout → mandate → confirmation. |
| `subscription-management.spec.ts` | Self-service: view subscriptions → pause → resume → skip → change quantity → cancel. |
| `admin-orders.spec.ts` | Ops flow: view orders → mark picked → mark packed → mark dispatched → mark delivered. |

| Item | Detail |
|---|---|
| `e2e/` directory | Root-level Playwright test directory. |
| `playwright.config.ts` | Base URL: storefront `localhost:3000`, admin `localhost:3001`. Screenshot on failure. |
| Test data | Seed script creates test user + products + inventory batches for E2E runs. |
| CI integration | Add Playwright step to GitHub Actions (nightly, not on every PR due to duration). |

### Deliverable 2 — Integration Tests: Full Subscription Lifecycle

End-to-end integration test covering all 9 FSM transitions in sequence:

```
1. Create subscription → status: PENDING
2. Simulate subscription.activated webhook → status: ACTIVE, first order created
3. Advance time to nextBillingAt → BullMQ job fires → status: RENEWAL_DUE
4. Simulate subscription.charged webhook → status: ACTIVE, renewal order created
5. Advance time again → RENEWAL_DUE
6. Simulate subscription.payment_failed → status: DUNNING
7. Simulate subscription.charged (retry) → status: ACTIVE (recovery)
8. User pauses subscription → status: PAUSED
9. User resumes → status: ACTIVE
10. User cancels (with reason) → status: CANCELLED
```

Each step verifies:
- Status transition is correct
- Side effects fired (orders created, notifications queued, Razorpay calls made)
- Audit log entries created
- Illegal transitions rejected

### Deliverable 3 — BullMQ Renewal Job Load Test

| Test | Detail |
|---|---|
| Setup | Seed 500 `Subscription` records with `status: ACTIVE` and `nextBillingAt: now()`. |
| Execution | Trigger the renewal job. Measure processing time. |
| Assertions | All 500 subscriptions transitioned to `RENEWAL_DUE`. No missed subscriptions. No duplicate processing. |
| Performance target | < 60 seconds for 500 subscriptions (assuming mocked Razorpay calls). |
| Failure handling | Test that job retries on transient error without losing state. |
| Monitoring | Log: total processed, failed, skipped, duration. |

### Deliverable 4 — Webhook Idempotency Stress Test

| Test | Detail |
|---|---|
| Setup | Create 1 subscription. Generate 1 valid `subscription.charged` webhook payload. |
| Execution | Send the same payload 100 times in rapid succession (concurrent). |
| Assertions | Exactly 1 renewal order created. `WebhookEvent` table has exactly 1 row for that `eventId`. Remaining 99 return `200 OK` but are no-ops. |
| Concurrency | Use `Promise.allSettled()` to fire all 100 requests simultaneously. |
| Edge case | Test race condition: two simultaneous first-time events for the same `eventId`. Only one should process. |

> [!IMPORTANT]
> Per §16: "Webhook idempotency skipped → Duplicate order fulfillment on Razorpay retry." This stress test MUST pass before launch.

### Deliverable 5 — FEFO Compliance Verification

| Test | Detail |
|---|---|
| Setup | Create 10 `InventoryBatch` records with varying `expiresAt` dates. |
| Test 1 | `getPickList()` returns batches strictly sorted by `expiresAt ASC`. |
| Test 2 | After depleting nearest-expiry batch, next pick list starts from second-nearest. |
| Test 3 | `QUARANTINE` and `REJECTED` batches never appear in pick list. |
| Test 4 | Under 100 concurrent pick list requests, ordering never breaks. |
| Metric | FEFO compliance = 0% out-of-order dispatches (per §12.2). |

---

## Proposed Changes

### Root

---

#### [NEW] `e2e/playwright.config.ts`
Playwright configuration: base URLs, timeout, screenshot on failure, parallel workers.

#### [NEW] `e2e/checkout-flow.spec.ts`
E2E test: full one-time purchase flow.

#### [NEW] `e2e/subscription-flow.spec.ts`
E2E test: subscription creation + mandate authentication.

#### [NEW] `e2e/subscription-management.spec.ts`
E2E test: self-service actions (pause, resume, skip, cancel).

#### [NEW] `e2e/admin-orders.spec.ts`
E2E test: admin order management (pick → pack → dispatch → deliver).

#### [NEW] `e2e/fixtures/seed-e2e.ts`
E2E seed script: test user, products, inventory, subscriptions.

---

### Backend — NestJS API

---

#### [NEW] `apps/api/src/modules/subscription/subscription-lifecycle.integration.spec.ts`
Full lifecycle integration test covering all 9 FSM transitions in sequence.

#### [NEW] `apps/api/src/jobs/subscription-renewal.load.spec.ts`
Load test: 500 concurrent subscription renewals.

#### [NEW] `apps/api/src/modules/webhooks/webhooks.stress.spec.ts`
Stress test: 100 rapid-fire duplicate webhook events.

#### [NEW] `apps/api/src/modules/orders/fefo-compliance.spec.ts`
FEFO compliance test under concurrent access.

---

### CI/CD

---

#### [MODIFY] `.github/workflows/ci.yml`
Add steps:
- Unit tests: `cd apps/api && pnpm jest`
- Integration tests: `cd apps/api && pnpm jest --config jest.integration.config.ts`
- E2E tests: `npx playwright test` (nightly cron, not every PR)

---

## Dependencies to Install

| Package | Where | Why |
|---|---|---|
| `@playwright/test` | Root (devDep) | E2E browser testing |
| `playwright` | Root (devDep) | Browser binaries for E2E |

---

## Out of Scope (Phase 3)

- Rewards ledger → Week 13-14
- Referral system → Week 16
- Sanity CMS → Week 17-18
- Metabase BI → Week 19
- PostHog funnels → Week 20

---

## Verification Plan

### Automated Tests

1. **Unit tests** — full suite:
   ```bash
   cd apps/api && pnpm jest
   ```
   - All existing unit tests pass (subscription FSM, dunning, cart, checkout, inventory)

2. **Integration tests**:
   ```bash
   cd apps/api && pnpm jest --config jest.integration.config.ts --testPathPattern=lifecycle
   ```
   - Full subscription lifecycle test passes

3. **Load test**:
   ```bash
   cd apps/api && pnpm jest --testPathPattern=load --detectOpenHandles
   ```
   - 500 renewals processed in < 60 seconds

4. **Stress test**:
   ```bash
   cd apps/api && pnpm jest --testPathPattern=stress
   ```
   - 100 duplicate webhooks → exactly 1 order created

5. **E2E tests**:
   ```bash
   npx playwright test
   ```
   - All Playwright tests pass

6. **Build check**:
   ```bash
   pnpm turbo run build
   ```

### Test Coverage Report

7. **Coverage target** — minimum 80% line coverage for:
   - `subscription.service.ts` (FSM logic)
   - `webhooks.service.ts` (idempotency)
   - `orders.service.ts` (pick list / FEFO)

### Manual Verification

8. **Phase 2 sign-off checklist**:
   - [ ] Full one-time purchase flow works end-to-end
   - [ ] Full subscription flow works end-to-end
   - [ ] Renewal generates orders automatically
   - [ ] Dunning recovers on retry or auto-cancels
   - [ ] All 7 self-service features work
   - [ ] Delivery slots work with capacity limits
   - [ ] Webhook idempotency holds under load
   - [ ] FEFO compliance is 100%
   - [ ] No console.log in committed code (NestJS Logger only)

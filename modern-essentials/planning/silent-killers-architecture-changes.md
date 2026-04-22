# Silent Killers: Architectural Risks & Resolutions

This document tracks "silent killers"—architectural issues that typically only appear under high concurrency or edge-case network conditions. Addressing these is critical for a subscription-first D2C brand handling perishables.

## 1. Inventory Race Conditions & Deadlocks
**Risk:** Multiple users purchasing the same item simultaneously (overselling) or two transactions locking items in reverse order (database deadlock).
- **Status:** ✅ RESOLVED
- **Resolution:**
  - Implemented **Pessimistic Locking** (`FOR UPDATE`) in `CheckoutService.verifyPayment`.
  - **Deadlock Prevention:** All items are sorted by `variantId` before locking to ensure a consistent lock order across all concurrent transactions.
- **Verification:** `verifyPayment` now uses a raw SQL query to lock inventory batches using FEFO order.

## 2. Webhook Idempotency (Double-Processing)
**Risk:** Razorpay or other providers sending the same event multiple times, leading to duplicate orders, double charges, or duplicate reward points.
- **Status:** ✅ RESOLVED
- **Resolution:**
  - Wrapped `handleRazorpayEvent` in a Prisma `$transaction`.
  - Implemented **Pessimistic Locking** (`FOR UPDATE`) on the `WebhookEvent` record during processing.
  - Modified `SubscriptionService.transitionStatus` to accept an optional transaction client to ensure business logic and idempotency state are atomic.
  - Explicitly marked `processed: true` as the final step before transaction commit.
- **Verification:** `WebhooksService` and `SubscriptionService` updated and verified via API tests.

## 3. Reward Points "Double-Spend"
**Risk:** A user attempting to use their points on two different devices/browsers at the exact same millisecond.
- **Status:** ⏳ PENDING
- **Plan:**
  - Implement `FOR UPDATE` locking on the `User` or `LedgerEntry` record when calculating the available balance during checkout.
  - Ensure the balance calculation is never "stale" before the points are deducted.

## 4. Perishable Restock Trap (Cancellations)
**Risk:** Standard e-commerce logic simply adds cancelled items back to stock. For perishables (Eggs/Dairy), an item that has already been picked or dispatched cannot be safely restocked.
- **Status:** ⏳ PENDING
- **Plan:**
  - Update cancellation logic in `OrdersService`.
  - **Rule:** If `status` is `PENDING` or `PAID` (not yet picked), increment `InventoryBatch.qty`.
  - **Rule:** If `status` is `PICKED`, `PACKED`, or `DISPATCHED`, log the item as `WastageReason.CUSTOMER_RETURN` or `EXPIRED` instead of restocking.

## 5. Subscription "Ghost" Renewals
**Risk:** Background jobs crashing or overlapping, leading to duplicate subscription charges or skipped renewals.
- **Status:** ⏳ PENDING
- **Plan:**
  - Move to **Atomic State Transitions**: `UPDATE subscriptions SET status = 'ACTIVE' WHERE status = 'RENEWAL_DUE'`.
  - This ensures that even if two jobs run at once, only the first one to successfully transition the status performs the charge/order creation logic.

## 6. Ledger Integrity (Immutability)
**Risk:** Manually updating a "total points" column on a user record without an audit trail.
- **Status:** ✅ PARTIALLY RESOLVED (via Schema)
- **Plan:**
  - Enforce the "Ledger Law": The rewards balance is *calculated* from `LedgerEntry` rows, never updated as a single number.
  - Add a database trigger or strict service-level constraint to prevent any `UPDATE` on the `ledger_entries` table (Append-only).

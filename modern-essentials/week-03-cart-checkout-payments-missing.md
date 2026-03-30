# Week 3 Cart, Checkout & Payments: Missing Pieces & Refinements

Based on an audit of the repository against the `@planning/week-03-cart-checkout-payments.md` blueprint, the following items are missing, require refinement, or deviate from the original architectural plan.

## High Priority: Backend (NestJS API) Security & Logic

| Item | Description | Impact |
|---|---|---|
| Webhook Signature Validation | `WebhooksController.handleRazorpayWebhook` lacks signature verification using the `RAZORPAY_WEBHOOK_SECRET`. | Security risk; anyone can spoof webhook events to manipulate order/subscription statuses. |
| Webhook Subscription Mapping | `WebhooksService.handleRazorpayEvent` uses a `mock-sub-id` instead of looking up the subscription by `razorpay_subscription_id`. | Webhooks will fail to update the correct subscription records in the database. |
| Cart API Sync | `CartContext.tsx` in `apps/web` currently only persists to `localStorage` and does not call the NestJS Cart API. | Carts are not persistent across devices or sessions if the user clears their browser data; violates §13 Week 3 spec. |
| Razorpay ID Mapping | The `Subscription` and `Order` models in `schema.prisma` are missing fields to store `razorpaySubscriptionId` and `razorpayOrderId` for future lookups. | Impossible to map incoming webhooks to internal records without these fields. |

## Medium Priority: Backend Refinements

| Item | Description | Impact |
|---|---|---|
| Redundant User Creation | `CartService.getOrCreateCart` contains logic to create a user if they don't exist. | This should be handled by the `ClerkAuthGuard` or a dedicated sync service to avoid duplicate/inconsistent user logic. |
| Transaction Safety | `CheckoutService.verifyPayment` correctly uses a transaction, but should ensure the `Cart` is cleared *atomically* with order creation. | Potential for double-orders or cart-clearing failures if not handled within the same transaction. |

## Low Priority: Frontend UI

| Item | Description | Impact |
|---|---|---|
| Cart Drawer Visibility | `CartSidebar` (Cart Drawer) component exists but is not rendered in the root layout. | Users cannot see or interact with their cart unless they are on specific pages. |

## Suggested Implementation Strategy

1. **Secure Webhooks**: Implement HMAC-SHA256 verification in `WebhooksController` using the Razorpay SDK or `crypto` module.
2. **Update Schema**: Add `razorpayOrderId String? @unique` and `razorpaySubscriptionId String? @unique` to the `Order` and `Subscription` models respectively.
3. **Connect Cart API**: Update `CartContext.tsx` to perform `fetch` calls to the `/cart` endpoints in addition to local state updates.
4. **Fix Webhook Mapping**: Update `WebhooksService` to query the database using the Razorpay IDs provided in the webhook payload.
5. **Global Cart Sidebar**: Add `<CartSidebar />` to `apps/web/src/app/layout.tsx`.

---
*Created by Gemini CLI on 30 March 2026*

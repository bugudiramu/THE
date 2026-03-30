# Week 3: Cart + Checkout + Razorpay One-Time Payments

> **Blueprint Ref:** §3.1 (Subscription Engine — P0 Week 3), §6.1 (Module Ownership — Orders), §6.2 (Orders Table), §6.4 (Razorpay Webhook Catalogue — `payment.captured`, `payment.failed`, `order.paid`), §13 Phase 1 Week 3, §16 (Technical Debt Traps — Webhook Idempotency)
> **Sprint Goal:** A customer can add products to a cart, proceed to checkout, pay via Razorpay (UPI / card / netbanking), and receive an order confirmation — with the order visible in the database, webhook idempotency enforced from Day 1.

---

## Current State (End of Week 2)

| Area | Status |
|---|---|
| Catalog API | Full CRUD on `Product`. Public read, guarded write endpoints. |
| Storefront | Product listing + detail pages rendering real data. Clerk auth integrated. |
| Auth | Clerk on `apps/web` (client) + `apps/api` (JWT guard). Users can sign in/up. |
| Image upload | Cloudflare R2 via `aws-s3` module. Product images served via CDN. |
| Database | Core schema with enums. Seed data for products. |
| Cart | `Cart` + `CartItem` models exist in schema but **no API endpoints or UI**. |
| Payments | No Razorpay integration. No checkout flow. |
| Webhooks | `WebhookEvent` model with `@@unique([provider, eventId])` but **no webhook module**. |

---

## Objectives

1. Build the **cart module** in NestJS — add, update, remove items, get cart.
2. Build the **checkout module** — create Razorpay orders, verify payments, generate orders.
3. Build the **webhooks module** — receive and process Razorpay webhook events with idempotency.
4. Build the **storefront cart UI** — slide-out cart drawer with quantity controls.
5. Build the **checkout page** — address form, order summary, Razorpay payment modal.
6. Build the **order confirmation page** — displays order details after successful payment.

---

## Key Deliverables

### Deliverable 1 — NestJS Cart Module

| Endpoint | Method | Purpose |
|---|---|---|
| `GET /cart` | GET | Get current user's cart with items + product details. |
| `POST /cart/items` | POST | Add item to cart (or increment qty if exists). |
| `PATCH /cart/items/:id` | PATCH | Update item quantity. |
| `DELETE /cart/items/:id` | DELETE | Remove item from cart. |
| `DELETE /cart` | DELETE | Clear entire cart. |

All endpoints are authenticated via `ClerkAuthGuard`. Cart is keyed by `userId`.

| Item | Detail |
|---|---|
| `cart.module.ts` | Imports `PrismaModule`. Registers controller + service. |
| `cart.controller.ts` | Route handlers. Uses `@CurrentUser()` to scope to user's cart. |
| `cart.service.ts` | `findOrCreateCart(userId)`, `addItem()`, `updateItem()`, `removeItem()`, `clearCart()`. |
| `cart.dto.ts` | `AddToCartDto { productId: string, quantity: number }`, `UpdateCartItemDto { quantity: number }`. |

### Deliverable 2 — NestJS Checkout Module

| Endpoint | Method | Purpose |
|---|---|---|
| `POST /checkout/create-order` | POST | Creates a Razorpay order from the user's cart. Returns `razorpayOrderId` + `amount` + `key`. |
| `POST /checkout/verify-payment` | POST | Verifies Razorpay payment signature. Creates `Order` + `OrderItem` records in DB. Clears cart. |

| Item | Detail |
|---|---|
| `checkout.module.ts` | Imports `PrismaModule`. |
| `checkout.controller.ts` | Two endpoints. Both guarded by `ClerkAuthGuard`. |
| `checkout.service.ts` | `createOrder()` — calculates total, calls `razorpay.orders.create()`. `verifyPayment()` — HMAC signature check, creates order in DB, clears cart. |
| `checkout.dto.ts` | `CreateOrderDto { items[], name, phone, address }`, `RazorpayOrderResponseDto`. |

> [!IMPORTANT]
> Payment verification MUST use HMAC-SHA256 signature verification: `razorpay_order_id|razorpay_payment_id` signed with `RAZORPAY_KEY_SECRET`. Never trust client-side payment status.

### Deliverable 3 — NestJS Webhooks Module (Idempotent)

| Endpoint | Method | Purpose |
|---|---|---|
| `POST /webhooks/razorpay` | POST | Receives all Razorpay webhook events. Verifies signature. Processes idempotently. |

**Idempotency flow (per §6.4 and §16):**
1. Extract `event_id` from payload.
2. Check `WebhookEvent` table for `(provider: 'razorpay', eventId: event_id)`.
3. If `processedAt` is NOT null → return `200 OK` immediately (already processed).
4. If not found → insert row with `processedAt: null`.
5. Process event (delegate to appropriate service).
6. Set `processedAt = new Date()`.

**Handled events for Week 3:**

| Event | Action |
|---|---|
| `payment.captured` | Mark order as `PAID`. (Full fulfillment queue in Week 5.) |
| `payment.failed` | Mark order as `CANCELLED`. Notify user. |
| `order.paid` | Trigger order confirmation. |

### Deliverable 4 — Storefront Cart UI

| Component | Detail |
|---|---|
| `CartDrawer` | Slide-out drawer from right. Shows cart items with image, name, price, quantity controls (+/-), remove button, subtotal. |
| `CartIcon` | Header cart icon with item count badge. Clicking opens `CartDrawer`. |
| `CartContext` | React context + provider for cart state. Methods: `addToCart()`, `updateQuantity()`, `removeItem()`, `cartCount`, `cartTotal`. |
| "Add to Cart" buttons | On `ProductCard` and `ProductDetail`. Calls `CartContext.addToCart()` + API. Toast confirmation. |

### Deliverable 5 — Checkout Page

| Feature | Detail |
|---|---|
| Route | `/checkout` — protected by Clerk middleware. |
| Order summary | Lists all cart items with quantities and prices. Shows subtotal, delivery fee, total. |
| Customer details form | Name, phone, address fields. Pre-filled from Clerk profile if available. |
| Razorpay modal | On "Pay Now" click: calls `POST /checkout/create-order`, opens Razorpay checkout modal with returned `orderId` + `key`. |
| Payment success | On `razorpay.on('payment.success')`: calls `POST /checkout/verify-payment`, redirects to `/order-confirmation?orderId=...`. |
| Payment failure | Shows inline error message. "Try Again" button. |

### Deliverable 6 — Order Confirmation Page

| Feature | Detail |
|---|---|
| Route | `/order-confirmation?orderId=...` |
| Display | Order ID, payment ID, status badge, total amount, order date. |
| Next steps | Cards showing: "Confirmation email sent", "Order processed within 24h", "Delivery in 3-5 days". |
| Actions | "Continue Shopping" → `/products`. "View Order History" → `/orders`. |

---

## Proposed Changes

### Backend — NestJS API

---

#### [NEW] `apps/api/src/modules/cart/cart.module.ts`
NestJS module for cart management.

#### [NEW] `apps/api/src/modules/cart/cart.controller.ts`
REST endpoints for cart CRUD. All guarded.

#### [NEW] `apps/api/src/modules/cart/cart.service.ts`
Cart business logic. `findOrCreateCart()` ensures one cart per user.

#### [NEW] `apps/api/src/modules/cart/cart.dto.ts`
`AddToCartDto`, `UpdateCartItemDto` with `class-validator`.

#### [NEW] `apps/api/src/modules/checkout/checkout.module.ts`
Checkout module with Razorpay integration.

#### [NEW] `apps/api/src/modules/checkout/checkout.controller.ts`
`create-order` and `verify-payment` endpoints.

#### [NEW] `apps/api/src/modules/checkout/checkout.service.ts`
Razorpay order creation + HMAC payment verification + DB order creation + cart clearing.

#### [NEW] `apps/api/src/modules/checkout/checkout.dto.ts`
`CreateOrderDto`, `RazorpayOrderResponseDto`.

#### [NEW] `apps/api/src/modules/webhooks/webhooks.module.ts`
Webhook receiver module.

#### [NEW] `apps/api/src/modules/webhooks/webhooks.controller.ts`
`POST /webhooks/razorpay` endpoint. No auth guard (Razorpay sends directly). Signature verification instead.

#### [NEW] `apps/api/src/modules/webhooks/webhooks.service.ts`
Idempotency check + event delegation. Uses `WebhookEvent` table.

#### [MODIFY] `apps/api/src/app.module.ts`
Register `CartModule`, `CheckoutModule`, `WebhooksModule`.

---

### Shared Packages

---

#### [MODIFY] `packages/types/src/order.ts`
Add `CreateOrderPayload`, `PaymentVerificationPayload`, `OrderConfirmationResponse` interfaces.

#### [NEW] `packages/types/src/cart.ts`
`ICart`, `ICartItem`, `AddToCartPayload` interfaces.

#### [MODIFY] `packages/types/src/index.ts`
Re-export cart types.

---

### Frontend — Storefront (`apps/web`)

---

#### [NEW] `apps/web/src/contexts/CartContext.tsx`
React context for cart state management. Syncs with API on every mutation.

#### [NEW] `apps/web/src/components/CartDrawer.tsx`
Slide-out cart drawer with items, quantities, pricing, and checkout CTA.

#### [NEW] `apps/web/src/components/CartIcon.tsx`
Header cart icon with count badge. Opens `CartDrawer` on click.

#### [MODIFY] `apps/web/src/components/ProductCard.tsx`
Add "Add to Cart" button with `CartContext.addToCart()`.

#### [MODIFY] `apps/web/src/components/ProductDetail.tsx`
Add "Add to Cart" button with quantity selector.

#### [MODIFY] `apps/web/src/components/UserHeader.tsx`
Replace placeholder cart icon with `CartIcon` component.

#### [NEW] `apps/web/src/app/checkout/page.tsx`
Checkout page: order summary, customer form, Razorpay payment modal.

#### [NEW] `apps/web/src/app/order-confirmation/page.tsx`
Order confirmation page displaying order details from `?orderId=` param.

#### [MODIFY] `apps/web/src/app/layout.tsx`
Wrap with `CartProvider`. Add Razorpay checkout script to `<head>`.

---

## Dependencies to Install

| Package | Where | Why |
|---|---|---|
| `razorpay` | `apps/api` | Server-side Razorpay SDK for order creation |
| `crypto` | `apps/api` (built-in) | HMAC-SHA256 for payment signature verification |
| `react-hot-toast` or `sonner` | `apps/web` | Toast notifications for cart actions |

---

## Out of Scope (Week 4+)

- WhatsApp / email notifications on order → Week 4
- Order status tracking UI → Week 5
- Subscription checkout (recurring mandates) → Week 7
- Delivery slot selection → Week 11
- Rewards points on purchase → Week 13

---

## Verification Plan

### Automated Tests

1. **Cart API tests** — `apps/api/src/modules/cart/cart.service.spec.ts`:
   ```bash
   cd apps/api && pnpm jest --testPathPattern=cart
   ```
   - Test `addItem()` creates cart if none exists
   - Test `addItem()` increments qty for existing item
   - Test `removeItem()` deletes item
   - Test `clearCart()` removes all items

2. **Checkout API tests** — `apps/api/src/modules/checkout/checkout.service.spec.ts`:
   ```bash
   cd apps/api && pnpm jest --testPathPattern=checkout
   ```
   - Test `createOrder()` returns valid Razorpay order shape
   - Test `verifyPayment()` validates HMAC signature
   - Test `verifyPayment()` creates `Order` + `OrderItem` records
   - Test `verifyPayment()` clears cart after order creation

3. **Webhook idempotency tests** — `apps/api/src/modules/webhooks/webhooks.service.spec.ts`:
   ```bash
   cd apps/api && pnpm jest --testPathPattern=webhooks
   ```
   - Test duplicate `event_id` is processed only once
   - Test `payment.captured` transitions order to `PAID`

### Browser Verification

4. **Cart flow** — `http://localhost:3000/products`:
   - Add item to cart → toast appears, cart count badge increments
   - Open cart drawer → item visible with correct price
   - Change quantity → subtotal updates
   - Remove item → cart count decrements

5. **Checkout flow** — `http://localhost:3000/checkout`:
   - Order summary shows correct items and total
   - "Pay Now" opens Razorpay modal
   - After test payment → redirects to `/order-confirmation?orderId=...`
   - Order confirmation page shows order ID, amount, status

6. **Swagger** — `http://localhost:4000/api/docs`:
   - Cart and checkout endpoints documented
   - Webhook endpoint documented

### Manual Verification

7. **Database** — after successful payment:
   - `Order` record exists with `status: PAID`
   - `OrderItem` records match cart contents
   - `Cart` is empty
   - `WebhookEvent` record exists with `processedAt` set
8. **Idempotency** — send the same webhook payload twice → second time should be a no-op

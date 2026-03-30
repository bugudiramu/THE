# Week 4: Notifications — WhatsApp + Email (Mocked)

> **Blueprint Ref:** §3.1 (Customer Support — Freshdesk + WhatsApp), §4.1 (Email: Resend + React Email, WhatsApp: Interakt), §5.2 (NestJS Module Structure — `notifications/`, `jobs/`), §6.1 (Module Ownership — Notifications), §13 Phase 1 Week 4
> **Sprint Goal:** The system sends order-lifecycle notifications (confirmed, dispatched, delivered) via mocked WhatsApp and email queues using BullMQ — logging output to NestJS Logger since live API keys are not yet available.

---

## Current State (End of Week 3)

| Area | Status |
|---|---|
| Cart | Full CRUD API + storefront cart drawer UI. Cart syncs with API. |
| Checkout | Razorpay one-time payment. `POST /checkout/create-order` + `POST /checkout/verify-payment`. |
| Orders | `Order` + `OrderItem` created on successful payment. Status set to `PAID`. |
| Webhooks | `POST /webhooks/razorpay` with idempotency. Handles `payment.captured`, `payment.failed`. |
| Notifications | **None**. No email or WhatsApp integration. |
| Background jobs | **None**. BullMQ not yet configured. No Redis connection. |
| Email templates | `packages/email` scaffold exists but no templates built. |

---

## Objectives

1. Build the **NestJS notifications module** with job queues for asynchronous message dispatch.
2. Set up **BullMQ** with Redis for background job processing (notification dispatch queue).
3. Create **React Email templates** in `packages/email` for core order lifecycle events.
4. Build **mocked adapters** for Interakt (WhatsApp) and Resend (email) that log to NestJS Logger.
5. Wire notifications into the **order lifecycle** — trigger on status transitions.

---

## Key Deliverables

### Deliverable 1 — BullMQ Infrastructure

| Item | Detail |
|---|---|
| Redis connection | Add `REDIS_URL` to API env. Connect BullMQ to Upstash Redis (or local Docker Redis). |
| `BullModule` setup | Register `BullModule.forRoot()` in `app.module.ts` with Redis connection. |
| Notification queue | Named queue: `notifications`. Jobs dispatched asynchronously. |
| Worker | `notification-dispatch.job.ts` — processes `email` and `whatsapp` job types. |

### Deliverable 2 — NestJS Notifications Module

| Item | Detail |
|---|---|
| `notifications.module.ts` | Imports `BullModule.registerQueue({ name: 'notifications' })`. Registers service + processor. |
| `notifications.service.ts` | `sendOrderConfirmation(order)`, `sendOrderDispatched(order)`, `sendOrderDelivered(order)`. Each adds a job to the BullMQ queue. |
| `notifications.processor.ts` | `@Processor('notifications')` — handles job processing. Delegates to email/WhatsApp adapters. |
| `notifications.dto.ts` | `NotificationPayload { type, channel, recipient, data }`. |

### Deliverable 3 — Mocked Adapters

Since live API keys (Resend, Interakt) are not available yet, adapters log to NestJS Logger.

| Adapter | Detail |
|---|---|
| `adapters/email.adapter.ts` | Interface: `sendEmail(to, subject, html)`. Mock: logs `[EMAIL] To: ..., Subject: ...` via `Logger`. Swap to real Resend call when key is available. |
| `adapters/whatsapp.adapter.ts` | Interface: `sendTemplate(phone, templateName, params)`. Mock: logs `[WHATSAPP] To: ..., Template: ...` via `Logger`. Swap to real Interakt call when key is available. |

> [!IMPORTANT]
> Adapters use an interface pattern so that swapping mock → production is a single-line change in the module provider. No business logic changes required.

### Deliverable 4 — React Email Templates

Templates in `packages/email/emails/`:

| Template | Trigger | Content |
|---|---|---|
| `order-confirmed.tsx` | Order created (status = `PAID`) | Order ID, items list, total, estimated delivery. Brand header + footer. |
| `order-dispatched.tsx` | Order status → `DISPATCHED` | Order ID, tracking info placeholder, delivery window. |
| `order-delivered.tsx` | Order status → `DELIVERED` | Order ID, thank you message, rate your experience CTA. |
| `welcome.tsx` | New user signup (Clerk webhook) | Welcome message, brand intro, first order discount placeholder. |

### Deliverable 5 — Order Lifecycle Notification Triggers

| Order Status Transition | Notification Triggered |
|---|---|
| `→ PAID` | Email: `order-confirmed` + WhatsApp: "Order confirmed" template |
| `→ DISPATCHED` | Email: `order-dispatched` + WhatsApp: "Order dispatched" template |
| `→ DELIVERED` | Email: `order-delivered` + WhatsApp: "Order delivered" template |
| `→ CANCELLED` | Email: "Order cancelled" + WhatsApp: "Order cancelled" template |

---

## Proposed Changes

### Backend — NestJS API

---

#### [NEW] `apps/api/src/modules/notifications/notifications.module.ts`
Registers BullMQ queue `notifications`, service, processor, and adapter providers.

#### [NEW] `apps/api/src/modules/notifications/notifications.service.ts`
Public methods: `sendOrderConfirmation()`, `sendOrderDispatched()`, `sendOrderDelivered()`, `sendOrderCancelled()`. Each formats payload and adds to BullMQ queue.

#### [NEW] `apps/api/src/modules/notifications/notifications.processor.ts`
`@Processor('notifications')` class. Routes jobs to email or WhatsApp adapter based on `channel` field.

#### [NEW] `apps/api/src/modules/notifications/notifications.dto.ts`
`NotificationPayload`, `EmailPayload`, `WhatsAppPayload` types.

#### [NEW] `apps/api/src/modules/notifications/adapters/email.adapter.ts`
Mock email adapter. Logs to NestJS Logger. Interface ready for Resend swap.

#### [NEW] `apps/api/src/modules/notifications/adapters/whatsapp.adapter.ts`
Mock WhatsApp adapter. Logs to NestJS Logger. Interface ready for Interakt swap.

#### [NEW] `apps/api/src/jobs/notification-dispatch.job.ts`
BullMQ worker for the `notifications` queue.

#### [MODIFY] `apps/api/src/app.module.ts`
- Import `BullModule.forRoot({ connection: { url: process.env.REDIS_URL } })`.
- Register `NotificationsModule`.

#### [MODIFY] `apps/api/src/modules/checkout/checkout.service.ts`
After successful payment verification (`verifyPayment()`), inject `NotificationsService` and call `sendOrderConfirmation(order)`.

#### [MODIFY] `apps/api/src/modules/webhooks/webhooks.service.ts`
On `payment.captured`, trigger order confirmation notification.

---

### Shared Packages

---

#### [NEW] `packages/email/emails/order-confirmed.tsx`
React Email template: brand header, order details table, estimated delivery, footer.

#### [NEW] `packages/email/emails/order-dispatched.tsx`
React Email template: tracking info, delivery window, support contact.

#### [NEW] `packages/email/emails/order-delivered.tsx`
React Email template: thank you, rate experience CTA, referral link placeholder.

#### [NEW] `packages/email/emails/welcome.tsx`
React Email template: welcome message, brand story, first order link.

#### [MODIFY] `packages/email/package.json`
Add `@react-email/components`, `@react-email/render` dependencies.

---

## Dependencies to Install

| Package | Where | Why |
|---|---|---|
| `@nestjs/bullmq` | `apps/api` | BullMQ integration for NestJS |
| `bullmq` | `apps/api` | Background job queue library |
| `ioredis` | `apps/api` | Redis client for BullMQ connection |
| `@react-email/components` | `packages/email` | React Email UI component library |
| `@react-email/render` | `packages/email` | Renders React Email to HTML string |
| `resend` | `apps/api` | Email sending (installed now, used in mock mode) |

---

## Out of Scope (Week 5+)

- Ops admin dashboard → Week 5
- Live Interakt WhatsApp API calls → when API key available
- Live Resend email API calls → when API key available
- Subscription-specific notifications (renewal, dunning) → Week 9
- Push notifications → Phase 3
- Freshdesk integration → separate ops decision

---

## Verification Plan

### Automated Tests

1. **Notifications service tests** — `apps/api/src/modules/notifications/notifications.service.spec.ts`:
   ```bash
   cd apps/api && pnpm jest --testPathPattern=notifications
   ```
   - Test `sendOrderConfirmation()` adds job to queue with correct payload
   - Test processor routes `email` channel to email adapter
   - Test processor routes `whatsapp` channel to WhatsApp adapter

2. **Email template rendering** — `packages/email`:
   ```bash
   cd packages/email && pnpm dev
   ```
   - Opens React Email dev server to preview templates

3. **Build check**:
   ```bash
   pnpm turbo run build
   ```

### Browser Verification

4. **End-to-end order flow** — `http://localhost:3000`:
   - Place an order through checkout
   - Check NestJS terminal output for `[EMAIL]` and `[WHATSAPP]` log lines
   - Verify log contains correct order ID, customer email, phone

5. **React Email preview** — `http://localhost:3001` (React Email dev server):
   - `order-confirmed` template renders with sample data
   - `order-dispatched` template renders with tracking placeholder
   - `welcome` template renders with brand styling

### Manual Verification

6. **BullMQ dashboard** — verify jobs are processed:
   - Check Redis for completed jobs in the `notifications` queue
   - Confirm no stuck/failed jobs
7. **Adapter swap test** — temporarily replace mock adapter with console output to verify interface contract works

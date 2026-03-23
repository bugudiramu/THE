# Week 4: Subscription Engine & Notifications (Mocked)

## Objectives
- Finalize the **Razorpay Subscriptions Integration** and the front-end UI toggles that are currently tracked locally in git (`apps/web/src/components/SubscriptionToggle.tsx` and the NestJS `subscription` module).
- Build the rigorous **9-state Subscription State Machine (FSM)** in PostgreSQL via Prisma.
- Set up **Mocked Interakt (WhatsApp) and Resend (Email)** notification logging mechanisms. Since valid API keys are not available yet, we will mock these queues using BullMQ to simply log out the output during local development.
- Enforce the **Idempotency Rule** rigorously by validating against our `webhook_events` table (which is correctly set up with `@@unique([provider, eventId])`).

## Key Deliverables
1. Audit and finalize the uncommitted files in `apps/api/src/modules/subscription/`. Ensure every module strictly has `module.ts`, `controller.ts`, `service.ts`, and `dto.ts` with Class Validator typing.
2. Implement **BullMQ worker** for `subscription-renewal.job.ts`.
3. Set up the local notification queues to `console.log()` to the NestJS logger instead of calling out to Resend/Interakt for now.
4. Hook up the core Razorpay incoming webhooks (`subscription.activated`, `subscription.charged`, etc.).

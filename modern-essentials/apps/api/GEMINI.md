# GEMINI.md - API Service (Main Backend)

## Overview
Central backend API for Modern Essentials. Built with NestJS, Prisma, and BullMQ.

## Key Modules
- **Subscription Module:** Implements the core subscription state machine (Active, Paused, Cancelled, Dunning).
- **Inventory Module:** Handles FEFO logic, batch tracking, and reconciliation.
- **Order Module:** Manages order creation, fulfillment status, and history.
- **Payment Module:** Integration with Razorpay (Subscriptions & One-time).
- **Webhook Module:** Idempotent processing of external events (Razorpay, etc.).
- **Jobs Module:** Background tasks for subscription billing, reminders, and dunning.

## Tech Stack
- **Framework:** NestJS
- **ORM:** Prisma
- **Queue:** BullMQ (Redis-backed)
- **Validation:** class-validator, class-transformer
- **Documentation:** Swagger (at `/api/docs`)

## Core Mandates
- **Idempotency:** Every webhook handler MUST check the `webhook_events` table before processing.
- **State Transitions:** Subscription status changes happen ONLY in `SubscriptionService`.
- **FEFO Enforcement:** Prisma queries for stock MUST include `ORDER BY expires_at ASC`.
- **Logging:** Use the NestJS `Logger`. No `console.log`.

## Environment Variables
- `DATABASE_URL`: PostgreSQL connection string.
- `REDIS_URL`: Redis connection string for BullMQ.
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`: Razorpay credentials.
- `CLERK_SECRET_KEY`: Clerk secret key for auth validation.

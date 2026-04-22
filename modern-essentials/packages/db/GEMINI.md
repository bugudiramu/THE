# GEMINI.md - Database Layer (Prisma)

## Overview
Shared database layer for the entire monorepo. Contains the Prisma schema and the generated Prisma Client.

## Key Models
- **Subscription:** Central record for recurring orders, status, and frequency.
- **Order:** Individual delivery records linked to subscriptions or one-time purchases.
- **InventoryBatch:** Tracks physical stock with `expires_at` and `qc_status`.
- **LedgerEntry:** Immutable record of reward point changes.
- **WebhookEvent:** Logs incoming webhooks for idempotency.
- **Product & ProductVariant:** Catalog data with support for multiple sizes/packs.

## Workflow
1. Modify `schema.prisma`.
2. Run `pnpm db:migrate` (from root or this folder).
3. Run `pnpm db:generate` to update the Prisma Client.
4. (Optional) Run `pnpm db:seed` to populate initial data.

## Conventions
- **Naming:** camelCase for fields, PascalCase for models.
- **Soft Deletes:** Use an `isActive` or `deletedAt` field instead of hard deletes where appropriate.
- **Timestamps:** Every model should have `createdAt` and `updatedAt`.

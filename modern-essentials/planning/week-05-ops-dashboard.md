# Week 5: Ops Admin Dashboard v1

## Objectives
- Stand up the internal operations portal inside `apps/admin` (Next.js 14).
- Ops team members must never touch the `apps/web` customer storefront to fulfill orders.
- Create views that query from the central `packages/db` Prisma schema.

## Key Deliverables
1. **Today's Orders View**: Status counts (pending / packed / dispatched / delivered) and a queue view for exception orders.
2. **Pick List View**: A strictly FEFO-sorted list mapping order items to exact warehouse bin locations and batch IDs.
3. **Dispatch Manifest View**: A route-wise printout for handing off to Shadowfax couriers.
4. **Setup Shared Packages**: Ensure `apps/admin` is correctly configured in the Turborepo UI chain safely utilizing `packages/types` and `packages/db`.

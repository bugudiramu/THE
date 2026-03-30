# Week 5 Ops Admin Dashboard: Missing Pieces & Refinements

Based on an audit of the repository against the `@planning/week-05-ops-dashboard.md` blueprint, the following items are missing, require refinement, or deviate from the original architectural plan.

## High Priority: Data Model & Architecture

| Item | Description | Impact |
|---|---|---|
| Missing Address Fields | The `Order` model in `schema.prisma` lacks delivery address fields (street, city, state, pincode). | Dispatch manifests cannot group orders by delivery area/pincode as specified in §8.1. |
| Server Components vs Client Components | `apps/admin` uses Client Components and `fetch` calls for all data. The blueprint specified using Server Components for direct `packages/db` access for read-only views. | Higher latency and more boilerplate; bypasses the performance benefits of Next.js 14 Server Components. |
| Hard-coded Logic | Status transition logic and labels are duplicated/hard-coded in `apps/admin/src/app/orders/page.tsx` instead of being driven by the API or a shared config. | Maintenance overhead and potential for UI/API state desync. |

## Medium Priority: Dashboard Features

| Item | Description | Impact |
|---|---|---|
| Grouping by Area | `OrdersService.getDispatchManifest` returns a flat list because it lacks address data to group by. | Inefficient for dispatch leads who need route-grouped manifests. |
| Role-based Access | `ClerkAuthGuard` is implemented, but the admin-specific role check (`ops` or `admin`) is not yet fully enforced via Clerk metadata. | Security risk; any authenticated user might access admin endpoints. |

## Low Priority: UI/UX

| Item | Description | Impact |
|---|---|---|
| Print-Optimized CSS | While a `PrintButton` component exists, specific `@media print` styles for the pick-list and manifest tables are minimal. | Physical print-outs for warehouse/couriers may not be properly formatted. |

## Suggested Implementation Strategy

1. **Update `Order` Schema**: Add `addressLine1`, `city`, `state`, and `postalCode` to the `Order` model.
2. **Refactor Admin Views**: Convert read-only dashboard pages to Server Components to utilize direct Prisma queries from `packages/db`.
3. **Enhance `getDispatchManifest`**: Once address fields are added, implement grouping by `postalCode` in the service.
4. **Centralize FSM Logic**: Move the `VALID_TRANSITIONS` map to a shared package or expose it via an API endpoint so the frontend can dynamically render action buttons.

---
*Created by Gemini CLI on 30 March 2026*

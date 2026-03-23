# Week 6: Inventory Batch Management & QC

## Objectives
- **FEFO (First Expired, First Out) Logic**: Establish the primary inventory queries where the absolute law is `ORDER BY expires_at ASC`.
- Create the tracking for arriving Farm Batches and standardizing GRN (Goods Receipt Note) inputs.
- Quality Control (QC) module recording parameters like float tests and visual breakages.

## Key Deliverables
1. **Inventory Module**: Write the backend API for stock intake (`apps/api/src/modules/inventory/`).
2. **Admin UI Views**: Build the "Inventory Status" and "QC Log" views inside `apps/admin`.
3. **Day-End Reconciliation Strategy**: Map the API logic for reconciling the daily manual wastage with the expected DB inventory stock levels.
4. **Zoho Books Architecture Prep**: Stub out the initial integration code to pipe Daily GMV to Zoho endpoints (this will be a simple scheduled CRON/BullMQ pipeline).

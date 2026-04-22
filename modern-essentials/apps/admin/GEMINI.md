# GEMINI.md - Admin Dashboard (Internal Operations)

## Overview
Internal operations dashboard for managing inventory, orders, and fulfillment. Built with Next.js 14 (App Router), Tailwind CSS, and shadcn/ui.

## Key Features
- **FEFO Inventory Management:** Tracking inventory batches with expiry dates and QC status.
- **Order Fulfillment:** Pick, pack, and dispatch workflows.
- **Wastage Logging:** Recording expired or damaged items.
- **Inventory Reconciliation:** Periodically syncing physical stock with system records.
- **Dispatch Management:** Coordinating with delivery partners.

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS, shadcn/ui
- **Auth:** Clerk (with role-based access control for admin)

## Core Laws & Conventions
- **FEFO Law:** All inventory selection must prioritize the earliest expiry date.
- **QC Status:** Items must be marked as `PASSED` before being eligible for fulfillment.
- **Wastage:** Every removal of stock that is NOT an order fulfillment must be logged as wastage.

## Important Patterns
- **Data Grids:** Extensive use of tables for inventory and order management.
- **Real-time Updates:** (Optional) Use of polling or WebSockets for dispatch tracking.

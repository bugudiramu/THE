# GEMINI.md - Shared Types

## Overview
Central repository for all TypeScript interfaces, types, and enums used across the monorepo.

## Structure
- `src/index.ts`: Main entry point exporting all types.
- `src/subscription.ts`: Types related to subscription states and frequencies.
- `src/inventory.ts`: Types for inventory batches and QC statuses.
- `src/order.ts`: Order fulfillment and status types.
- `src/user.ts`: User profile and auth-related types.

## Conventions
- **Explicit Exports:** Always export types from their specific file and re-export from `index.ts`.
- **Consistency:** Ensure types match the Prisma schema definitions.
- **No Logic:** This package should ONLY contain type definitions.

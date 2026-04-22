# GEMINI.md - Shared UI Components

## Overview
Centralized UI component library based on shadcn/ui and Tailwind CSS.

## Structure
- `src/components/ui`: Atomic components (Button, Input, Card, etc.).
- `src/components`: More complex shared components used by both Web and Admin.
- `src/lib/utils.ts`: Standard shadcn utility (cn).

## Usage
- Both `apps/web` and `apps/admin` import from this package to ensure design consistency.
- Styling is driven by Tailwind CSS configuration defined in `packages/config/tailwind.config.js`.

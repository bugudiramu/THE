# GEMINI.md - Web Storefront (Customer Facing)

## Overview
Customer-facing storefront for Modern Essentials. Built with Next.js 14 (App Router), Tailwind CSS, and shadcn/ui.

## Key Features
- **Product Discovery:** Browsing fresh essentials with radical transparency (cost breakdowns).
- **Subscription Checkout:** Seamless subscription setup using Razorpay.
- **User Dashboard:** Managing subscriptions (pause, resume, skip, cancel), viewing order history, and tracking rewards.
- **Rewards System:** Visual representation of the rewards ledger.
- **Traceability:** Viewing batch-specific information for delivered products.

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS, shadcn/ui
- **Auth:** Clerk (Frontend integration)
- **Payments:** Razorpay Standard Checkout
- **State Management:** React Context/Hooks for local state

## Important Patterns
- **Server Components:** Use RSCs for data fetching whenever possible.
- **Client Components:** Use sparingly for interactive elements.
- **Form Validation:** Use `react-hook-form` with `zod`.
- **API Proxy:** All API calls should go through the Next.js `rewrites` or `fetch` to `apps/api`.

## Environment Variables
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk public key.
- `CLERK_SECRET_KEY`: Clerk secret key.
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`: Razorpay public key.
- `NEXT_PUBLIC_API_URL`: Backend API URL.

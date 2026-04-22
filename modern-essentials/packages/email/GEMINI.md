# GEMINI.md - Transactional Emails

## Overview
React-based email templates for customer communication. Uses `react-email`.

## Key Templates
- **Order Confirmation:** Sent after successful checkout.
- **Subscription Update:** Notifications for pause, resume, or changes.
- **Dunning Recovery:** Reminders for failed payments.
- **Inventory Alerts:** (Internal) Alerts for low stock or high wastage.

## Workflow
- Templates are defined in `src/templates`.
- Compiled to HTML/Text for use in `apps/api`.

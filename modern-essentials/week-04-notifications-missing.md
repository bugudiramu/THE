# Week 4 Notifications: Missing Pieces & Refinements

Based on an audit of the repository against the `@planning/week-04-notifications.md` blueprint, the following items are missing, require refinement, or deviate from the original architectural plan.

## High Priority: Notification Logic & Templates

| Item | Description | Impact |
|---|---|---|
| Domain-Specific Methods | `NotificationsService` only has generic `sendEmail` and `sendWhatsApp` methods instead of `sendOrderConfirmation`, `sendOrderDispatched`, etc. | Business logic is leaked into controllers/services that should just be calling high-level notification methods. |
| Missing Email Templates | Only `order-confirmation.tsx` exists. `order-dispatched.tsx`, `order-delivered.tsx`, and `welcome.tsx` are missing. | Incomplete customer lifecycle communication. |
| Adapter Pattern | Missing the `adapters/` layer for Email and WhatsApp. | No clean separation between the service logic and the third-party providers (Resend/Interakt); makes swapping mocks for real APIs harder. |

## Medium Priority: Triggers & Integration

| Item | Description | Impact |
|---|---|---|
| Lifecycle Triggers | Notifications are not consistently triggered on order status transitions (e.g., `DISPATCHED`, `DELIVERED`). | Customers are not kept informed of their order progress automatically. |
| Clerk Webhook (Welcome) | No integration with Clerk webhooks to trigger the `welcome.tsx` email upon signup. | Missed opportunity for first-touch engagement. |

## Suggested Implementation Strategy

1. **Refactor `NotificationsService`**: Add high-level domain methods (`sendOrderConfirmation`, etc.) that wrap the generic queue calls.
2. **Implement Adapters**: Create `adapters/email.adapter.ts` and `adapters/whatsapp.adapter.ts` to encapsulate the `Logger` (and later, API) calls.
3. **Complete Templates**: Build out the remaining React Email templates in `packages/email/src/templates`.
4. **Wire Triggers**: Ensure `OrdersService` (or a dedicated event listener) calls the `NotificationsService` whenever an order status changes.

---
*Created by Gemini CLI on 30 March 2026*

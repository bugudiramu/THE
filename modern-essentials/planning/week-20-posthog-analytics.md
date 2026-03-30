# Week 20: PostHog Funnels, Feature Flags & A/B Testing

> **Blueprint Ref:** §4.1 (Product Analytics: PostHog — 1M events/mo free), §12.1 (Analytics Tools — PostHog: funnels, session recording, feature flags), §12.2 (Weekly Review Metrics), §13 Phase 3 Week 20
> **Sprint Goal:** PostHog is integrated into the storefront tracking 4 core conversion funnels (signup → first order → subscription → 3-month retained), session recording is active for UX debugging, and feature flags are deployed for A/B testing the subscription page — giving the team data-driven decision-making from Day 1 of Phase 4.

---

## Current State (End of Week 19)

| Area | Status |
|---|---|
| Product analytics | **None**. No event tracking on the storefront. |
| Funnels | **None**. No conversion funnel measurement. |
| Session recording | **None**. No UX debugging tool. |
| Feature flags | **None**. No A/B testing infrastructure. |
| PostHog | **Not integrated**. |

---

## Objectives

1. Integrate **PostHog** into the storefront for event tracking and analytics.
2. Define and instrument **4 core conversion funnels**.
3. Enable **session recording** for UX debugging and user behavior analysis.
4. Set up **feature flags** for safe rollout of new features.
5. Deploy the **first A/B test** — subscription page variant.

---

## Key Deliverables

### Deliverable 1 — PostHog Integration

| Item | Detail |
|---|---|
| PostHog project | Create project on PostHog Cloud (1M events/mo free tier). |
| Client SDK | Install `posthog-js` in `apps/web`. Initialize in `_app.tsx` / root layout. |
| Server SDK | Install `posthog-node` in `apps/api` for server-side events. |
| Identity | Link PostHog distinct ID to Clerk user ID on login for cross-session tracking. |
| Privacy | Respect cookies consent. No recording on sensitive pages (checkout payment fields). |
| Environment | `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` in `apps/web/.env.local`. |

### Deliverable 2 — Core Conversion Funnels

| Funnel | Steps | Purpose |
|---|---|---|
| **Signup → First Order** | `page_view:home` → `signup_completed` → `product_viewed` → `add_to_cart` → `checkout_started` → `payment_completed` | Measures first-purchase conversion |
| **Browse → Subscribe** | `product_viewed` → `subscription_toggled` → `frequency_selected` → `checkout_started` → `mandate_authenticated` | Measures subscription conversion |
| **Subscriber Retention** | `subscription_activated` → `first_renewal_paid` → `month_2_active` → `month_3_active` | Measures retention cohorts |
| **Referral Funnel** | `referral_link_shared` → `referred_signup` → `referred_first_order` → `referred_subscribed` | Measures referral program effectiveness |

**Events to instrument:**

| Event | Page/Component | Properties |
|---|---|---|
| `page_view` | All pages | `path`, `referrer`, `utm_source` |
| `product_viewed` | Product detail page | `productId`, `sku`, `price`, `category` |
| `subscription_toggled` | SubscriptionToggle | `toggled_to: 'subscribe' | 'one_time'` |
| `frequency_selected` | FrequencySelector | `frequency`, `productId` |
| `add_to_cart` | ProductCard / ProductDetail | `productId`, `qty`, `isSubscription` |
| `checkout_started` | Checkout page | `cartTotal`, `itemCount`, `hasSubscription` |
| `payment_completed` | Order confirmation | `orderId`, `amount`, `paymentMethod` |
| `mandate_authenticated` | Razorpay callback | `subscriptionId`, `amount` |
| `referral_link_shared` | ReferralCard | `channel: 'whatsapp' | 'email' | 'copy'` |
| `subscription_paused` | PauseDialog | `subscriptionId`, `duration` |
| `subscription_cancelled` | CancelFlow | `subscriptionId`, `reason` |

### Deliverable 3 — Session Recording

| Item | Detail |
|---|---|
| Enable | Turn on session recording in PostHog project settings. |
| Sampling | Record 10% of sessions initially (adjust based on volume). |
| Privacy | Mask input fields on checkout page. Do not record payment details. |
| Usage | Product team reviews recordings weekly for UX friction points. |
| Filters | Filter recordings by: signup funnel drop-off, checkout abandonment, subscription page visit. |

### Deliverable 4 — Feature Flags

| Flag | Type | Purpose |
|---|---|---|
| `subscription-page-v2` | Boolean | A/B test: new subscription page layout |
| `show-savings-badge` | Boolean | Toggle savings badge display |
| `referral-reward-amount` | Multivariate | Test different referral reward amounts (₹30 / ₹50 / ₹75) |
| `checkout-slot-picker` | Boolean | Gradual rollout of slot picker feature |

| Item | Detail |
|---|---|
| Feature flag SDK | `posthog.isFeatureEnabled('flag-name')` in React components. |
| Server-side flags | `posthog.getFeatureFlag('flag-name', userId)` in NestJS for API-level flags. |
| Rollout | Start at 10% → 50% → 100% based on metrics. |

### Deliverable 5 — First A/B Test: Subscription Page

| Variant | Detail |
|---|---|
| Control (A) | Current product page with existing subscription toggle. |
| Test (B) | Redesigned: larger savings badge, testimonials from subscribers, "Most Popular" plan highlighted, social proof ("2,340 subscribers"). |
| Metric | Subscription conversion rate: `mandate_authenticated / product_viewed`. |
| Duration | 2 weeks minimum, or until statistical significance (PostHog handles this). |
| Traffic split | 50/50 random split by PostHog. |

---

## Proposed Changes

### Frontend — Storefront (`apps/web`)

---

#### [NEW] `apps/web/src/lib/posthog.ts`
PostHog client initialization. Identify user on login. Page view tracking.

#### [NEW] `apps/web/src/components/PostHogProvider.tsx`
React context provider for PostHog. Wraps root layout.

#### [MODIFY] `apps/web/src/app/layout.tsx`
Import `PostHogProvider`. Wrap children.

#### [MODIFY] `apps/web/src/app/products/[id]/page.tsx`
Add event tracking: `product_viewed`, `subscription_toggled`, `frequency_selected`.

#### [MODIFY] `apps/web/src/components/ProductCard.tsx`
Track `add_to_cart` event with product properties.

#### [MODIFY] `apps/web/src/app/checkout/page.tsx`
Track `checkout_started`, `payment_completed` events. Mask sensitive fields from session recording.

#### [MODIFY] `apps/web/src/components/SubscriptionToggle.tsx`
Track toggle events. Support feature flag for variant B.

#### [MODIFY] `apps/web/src/components/referrals/ReferralCard.tsx`
Track `referral_link_shared` with channel.

#### [MODIFY] `apps/web/src/components/subscriptions/CancelFlow.tsx`
Track `subscription_cancelled` with reason.

---

### Backend — NestJS API

---

#### [NEW] `apps/api/src/common/posthog.service.ts`
PostHog Node.js client for server-side event tracking and feature flags.

#### [MODIFY] `apps/api/src/modules/subscription/subscription.service.ts`
Track server-side events: `subscription_activated`, `subscription_renewed`, `subscription_churned`.

---

## Dependencies to Install

| Package | Where | Why |
|---|---|---|
| `posthog-js` | `apps/web` | Client-side PostHog SDK for event tracking + feature flags |
| `posthog-node` | `apps/api` | Server-side PostHog SDK for backend events + flags |

---

## Out of Scope (Phase 4)

- Marketplace integrations → Phase 4
- Delivery agent PWA → Phase 4
- Dark store / hub management → Phase 4
- AI inventory forecasting → Phase 4
- Multi-city expansion → Phase 4

---

## Verification Plan

### Integration Verification

1. **PostHog dashboard**: Verify events appear in PostHog after browsing storefront:
   - `page_view` events show with correct paths
   - `product_viewed` events include product properties
   - `add_to_cart` events track correctly

2. **Funnel view**: In PostHog, create the 4 core funnels and verify steps connect

3. **Session recording**: Play back a recorded session — verify it captures page navigation and interactions

4. **Feature flags**: Toggle `subscription-page-v2` → verify storefront shows variant B for flagged users

### A/B Test Verification

5. **Split check**: Verify ~50% of users see variant A and ~50% see variant B
6. **Metric tracking**: Both variants track the same `mandate_authenticated` event

### Build Verification

7. ```bash
   pnpm turbo run build
   ```

### Manual Verification

8. **Privacy audit**: Verify payment fields are masked in session recordings
9. **Performance**: Verify PostHog script doesn't impact page load time (< 100ms overhead)
10. **Phase 3 completion checklist**:
    - [ ] Rewards ledger: earning, redemption, expiry all working
    - [ ] Referral system: dual-sided rewards tracking
    - [ ] Sanity CMS: farm pages + blog + batch traceability live
    - [ ] Metabase: 5 dashboards with 10 metrics
    - [ ] PostHog: 4 funnels instrumented, session recording active, first A/B test running
    - [ ] Definition of Done (§13): "Churn rate is measurable per acquisition cohort and LTV per channel is visible in Metabase" ✓

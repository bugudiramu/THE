# Enhanced Product Variations & Partner Links Implementation Plan

## Objective
To implement an advanced product variant system that supports multiple pack sizes, subscription frequencies, and prepayment durations, inspired by D2C brands like "The Happy Hens". Additionally, to provide "Also Buy From" external links for Quick Commerce platforms (Zepto, Blinkit, etc.).

## 1. Feature Breakdown & Scope

### A. Quick Commerce "Also Buy From" Links
*   **Partners Supported:** Instamart, Zepto, Flipkart Minutes, Blinkit.
*   **Behavior:** On the Product Details Page (PDP), show icons/links that redirect users to buy the product directly from a Quick Commerce app.

### B. Complex Product Variants Matrix
Users will select their purchase options in three steps:
1.  **Pack Size:** 6, 10, 12, 18, 20, 24, 26, 30.
2.  **How Often (Frequency):** 
    *   One time (Trial Pack)
    *   Weekly
    *   Alternate Week (Fortnightly)
    *   Monthly
3.  **How Long (Duration/Tenure):** 
    *   1 Month (4 Weeks)
    *   2 Months (8 Weeks)
    *   3 Months (12 Weeks)
    *   *(Note: Duration is not applicable for "One Time" purchases but can be mapped to predefined trial packs).*

## 2. Proposed Database Changes (Prisma)

To support this without breaking our existing schema, we need to introduce relations for external links and expand how we model products and subscriptions.

### A. Partner Links Schema
Add a model to store Quick Commerce links per product.
```prisma
model ProductPartnerLink {
  id        String   @id @default(cuid())
  productId String   @map("product_id")
  partner   Partner  // Enum: ZEPTO, BLINKIT, INSTAMART, FLIPKART
  url       String
  isActive  Boolean  @default(true) @map("is_active")

  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([productId, partner])
  @@map("product_partner_links")
}

enum Partner {
  ZEPTO
  BLINKIT
  INSTAMART
  FLIPKART
}
```

### B. Expanding Product & Subscription Plans
We have two architectural choices for Pack Sizes:
1.  **Option 1: Distinct Products (Recommended for simplicity).** Each pack size (e.g., 6 Eggs, 12 Eggs) is a distinct `Product` with its own `sku`. We add a `packSize` integer to the `Product` model.
2.  **Option 2: Product Variants.** Introduce a `ProductVariant` model.

Assuming Option 1 (Distinct Products) since it maps perfectly to FEFO inventory (a 6-pack is picked differently than a 12-pack):
```prisma
// Update Product Model
model Product {
  // ... existing fields ...
  packSize          Int?                 @map("pack_size") // e.g., 6, 10, 12
  partnerLinks      ProductPartnerLink[]
}

// Update SubscriptionPlan to support Prepaid Durations
model SubscriptionPlan {
  // ... existing fields ...
  durationMonths Int @default(1) @map("duration_months") // 1, 2, or 3
  
  // Total billing cycles on Razorpay (e.g., Weekly for 3 months = 12 cycles)
  billingCycles  Int? @map("billing_cycles")
}
```

## 3. Implementation Steps

### Phase 1: Quick Commerce Links (Low Effort, High Reward)
1.  **Schema Update:** Add the `ProductPartnerLink` model to `schema.prisma`.
2.  **Admin UI:** Add a section in the Admin Dashboard to manage Quick Commerce links for a product.
3.  **Storefront UI:** Update the Product Details Page (PDP) in the storefront to display "Also available on" icons below the "Add to Cart" button.

### Phase 2: Refactoring Product Catalog for Pack Sizes
1.  **Schema Update:** Add `packSize` to the `Product` model.
2.  **Data Migration:** Create standard Base Products (e.g., "Folate Enriched Eggs - 6 Pack", "Folate Enriched Eggs - 10 Pack").
3.  **Storefront UI:** On the PDP, add a "Pack Size" selector. Selecting a different size dynamically changes the loaded `Product` context (updating price, images, and subscription plans).

### Phase 3: Advanced Subscription Frequencies & Durations
1.  **Razorpay Integration Updates:**
    *   Currently, we map `SubscriptionPlan` to an open-ended Razorpay plan.
    *   For prepaid/fixed-duration plans (e.g., 3 Months Weekly = 12 deliveries), we need to update our Razorpay integration to pass `total_count` (billing cycles) when creating the subscription.
2.  **Storefront UI:** 
    *   Update the subscription widget to have 3 steps: `Pack Size -> Frequency -> Duration`.
    *   Build a pricing calculator/matrix that looks up the exact `SubscriptionPlan` ID based on the user's 3 selections.
3.  **Pricing Matrix:** Populate the `SubscriptionPlan` table with the exhaustive list of price points provided in the requirements.

## 4. Operational Considerations
*   **Fulfillment & Inventory:** Selling a 6-pack vs a 10-pack requires distinct SKUs in the warehouse. We must ensure FEFO logic seamlessly applies to these new SKUs.
*   **Prepaid vs Recurring:** The pricing provided implies prepaid amounts (e.g., Weekly for 3 months = Rs. 1,800 upfront). We need to clarify if this is a true *prepaid subscription* (charging Rs 1,800 immediately, then delivering 12 times) or a *commitment* (charging Rs 150 weekly for 12 weeks). Razorpay handles both, but the webhook logic differs heavily.

## 5. Next Steps to Proceed
When we are ready to build this, we will:
1.  Finalize the DB schema additions (`pnpm db:generate` & `pnpm db:migrate`).
2.  Update the `admin` app to allow managing the new prices, variants, and partner links.
3.  Update the `web` app PDP component to handle the 3-tier selection logic (Size -> Frequency -> Duration).
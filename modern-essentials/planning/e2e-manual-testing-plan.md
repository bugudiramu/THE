# Manual E2E Testing Plan: Modern Essentials

## Objective
Provide a step-by-step manual testing guide covering the complete lifecycle from product discovery to subscription management, order fulfillment, and inventory reconciliation across the Web, API, and Admin apps.

## Prerequisites
1. Start the local environment: `pnpm dev` (Starts Web on :3002, Admin on :3001, API on :4000).
2. Start Prisma Studio (optional but recommended for DB verification): `pnpm db:studio`.
3. Ensure Razorpay test keys are configured in `.env` files.
4. Have Clerk test accounts ready for both customer (Web) and ops/admin (Admin).
5. **Initial Data Setup**: Hit `http://localhost:4000/products/test/seed` to ensure sample products exist in the catalog.

---

## Phase 1: Inventory & Quality Control (Admin App)

### 1.1 Goods Receipt Note (GRN)
1. Login to **Admin App** (`http://localhost:3001`).
2. Navigate to **Inventory > GRN Intake** (`/inventory/grn`).
3. Select a product (e.g., "Fresh Regular Eggs"), enter received quantity (e.g., 500), set expiry date (e.g., 21 days from today), and submit.
4. **Verification**: Navigate to **Inventory Status** (`/inventory`) and verify the new batch appears with a `PENDING` QC status.

### 1.2 Quality Control (QC)
1. Navigate to **QC Log** (`/qc`).
2. Locate the recently added batch.
3. Click **PASSED** to approve the batch for sale.
4. **Verification**: Go to **Inventory Status** and verify the batch status is `AVAILABLE` and `PASSED`.

---

## Phase 2: Customer Storefront & Checkout (Web App)

### 2.1 Product Discovery & Cart
1. Login to **Web App** (`http://localhost:3002`) as a customer.
2. Navigate to **Products** (`/products`) and select a product.
3. On the product detail page, select **Subscribe & Save** and choose a frequency (e.g., WEEKLY).
4. Adjust the quantity and click **Subscribe Now**.
5. Open the Cart Sidebar and verify the subscription item, frequency, quantity, and total price.

### 2.2 Checkout & Payment
1. Click **Secure Checkout** from the cart sidebar.
2. Fill in delivery information (Name, Phone, Address, City, State, Postal Code).
3. Click **Complete Order** to trigger the Razorpay test modal.
4. Complete the test payment (use Razorpay test card details).
5. **Verification**: Upon success, you should be redirected to the **Order Confirmation** page.

---

## Phase 3: Order Fulfillment (Admin App)

### 3.1 Order Verification
1. Navigate to **Admin App > Today's Orders** (`/orders`).
2. Locate the new order. Verify its status is `PAID`.
3. Verify the order type (`SUBSCRIPTION_RENEWAL` for the first sub order, or `ONE_TIME`).

### 3.2 Picking & Packing
1. Navigate to **Pick List** (`/pick-list`).
2. Verify the order items are listed and matched to the correct inventory batch (FEFO order applies).
3. Go back to **Today's Orders** (`/orders`) and transition the order status:
   - Click `Pick` (changes status to `PICKED`).
   - Click `Pack` (changes status to `PACKED`).

### 3.3 Dispatch & Delivery
1. Navigate to **Dispatch** (`/dispatch`).
2. Verify the packed order appears in the dispatch manifest.
3. Click **Dispatch** (or bulk dispatch) to mark it `DISPATCHED`.
4. Go to **Today's Orders** and click `Deliver` to mark the order as `DELIVERED`.

---

## Phase 4: Subscription Management

### 4.1 Customer Self-Service (Web App)
1. Navigate to **Web App > Dashboard** (`/dashboard`).
2. Verify the active subscription and recent order are listed.
3. Click on the subscription to manage it (`/account/subscriptions/[id]`).
4. **Test Actions**:
   - **Pause**: Pause for 1 week. Verify status updates to `PAUSED`.
   - **Resume**: Resume the subscription. Verify status returns to `ACTIVE`.
   - **Skip Next Delivery**: Click skip and verify `nextDeliveryAt` is pushed forward.
   - **Change Frequency/Quantity**: Edit these values and confirm changes reflect on the page.

### 4.2 Admin Overrides (Admin App)
1. Navigate to **Admin App > Subscriptions** (`/subscriptions`).
2. Search for the customer's subscription.
3. Use the action buttons to force a Pause, Resume, or Cancel.
4. **Verification**: Confirm the status changes accurately.

---

## Phase 5: Automated Jobs & Edge Cases (API / BullMQ)

### 5.1 Subscription Renewal & Dunning
1. Navigate to **Bull Board** (`http://localhost:4000/admin/queues`).
2. Trigger the `subscription-renewal` job manually or verify its schedule.
3. **Verification**: Subscriptions with `nextBillingAt` <= now should transition to `RENEWAL_DUE`, and new orders should be generated if payment succeeds via webhooks.
4. If payment fails, verify the subscription enters the `dunning` queue and its status becomes `DUNNING`.

### 5.2 Inventory Reconciliation & Wastage
1. Navigate to **Admin App > Inventory > Reconcile** (`/inventory/reconcile`).
2. Select an active batch, enter a physical quantity lower than the system quantity, select a reason (e.g., `BREAKAGE_PACKING`), and submit.
3. **Verification**: Check **Wastage Log** (`/wastage`) to ensure the lost units are recorded with the correct reason. Check the batch to ensure its quantity is updated.

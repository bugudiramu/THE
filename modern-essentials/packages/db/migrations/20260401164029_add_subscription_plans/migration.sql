/*
  Warnings:

  - The values [PASSED,REJECTED] on the enum `QCStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "QCStatus_new" AS ENUM ('PENDING', 'PASS', 'QUARANTINE', 'REJECT');
ALTER TABLE "farm_batches" ALTER COLUMN "qc_status" DROP DEFAULT;
ALTER TABLE "inventory_batches" ALTER COLUMN "qc_status" DROP DEFAULT;
ALTER TABLE "inventory_batches" ALTER COLUMN "qc_status" TYPE "QCStatus_new" USING ("qc_status"::text::"QCStatus_new");
ALTER TABLE "farm_batches" ALTER COLUMN "qc_status" TYPE "QCStatus_new" USING ("qc_status"::text::"QCStatus_new");
ALTER TYPE "QCStatus" RENAME TO "QCStatus_old";
ALTER TYPE "QCStatus_new" RENAME TO "QCStatus";
DROP TYPE "QCStatus_old";
ALTER TABLE "farm_batches" ALTER COLUMN "qc_status" SET DEFAULT 'PENDING';
ALTER TABLE "inventory_batches" ALTER COLUMN "qc_status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "plan_id" TEXT;

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "frequency" "SubscriptionFrequency" NOT NULL,
    "amount" INTEGER NOT NULL,
    "razorpay_plan_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_razorpay_plan_id_key" ON "subscription_plans"("razorpay_plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_product_id_frequency_amount_key" ON "subscription_plans"("product_id", "frequency", "amount");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_plans" ADD CONSTRAINT "subscription_plans_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

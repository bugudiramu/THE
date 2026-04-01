/*
  Warnings:

  - The values [PASS,REJECT] on the enum `QCStatus` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[razorpay_subscription_id]` on the table `subscriptions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "WastageReason" AS ENUM ('BREAKAGE_PACKING', 'BREAKAGE_TRANSIT', 'QC_REJECTED', 'EXPIRED', 'CUSTOMER_RETURN', 'OTHER');

-- AlterEnum
BEGIN;
CREATE TYPE "QCStatus_new" AS ENUM ('PENDING', 'PASSED', 'QUARANTINE', 'REJECTED');
ALTER TABLE "inventory_batches" ALTER COLUMN "qc_status" DROP DEFAULT;
ALTER TABLE "inventory_batches" ALTER COLUMN "qc_status" TYPE "QCStatus_new" USING ("qc_status"::text::"QCStatus_new");
ALTER TABLE "farm_batches" ALTER COLUMN "qc_status" TYPE "QCStatus_new" USING ("qc_status"::text::"QCStatus_new");
ALTER TYPE "QCStatus" RENAME TO "QCStatus_old";
ALTER TYPE "QCStatus_new" RENAME TO "QCStatus";
DROP TYPE "QCStatus_old";
ALTER TABLE "inventory_batches" ALTER COLUMN "qc_status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "razorpay_subscription_id" TEXT;

-- CreateTable
CREATE TABLE "farms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "contact_name" TEXT,
    "contact_phone" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farm_batches" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "inventory_batch_id" TEXT NOT NULL,
    "qty_collected" INTEGER NOT NULL,
    "collected_at" TIMESTAMP(3) NOT NULL,
    "qc_status" "QCStatus" NOT NULL DEFAULT 'PENDING',
    "temperature_on_arrival" DOUBLE PRECISION,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "farm_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wastage_logs" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "inventory_batch_id" TEXT,
    "qty" INTEGER NOT NULL,
    "reason" "WastageReason" NOT NULL,
    "logged_by" TEXT NOT NULL,
    "notes" TEXT,
    "logged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wastage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "farm_batches_inventory_batch_id_key" ON "farm_batches"("inventory_batch_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_razorpay_subscription_id_key" ON "subscriptions"("razorpay_subscription_id");

-- AddForeignKey
ALTER TABLE "farm_batches" ADD CONSTRAINT "farm_batches_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farm_batches" ADD CONSTRAINT "farm_batches_inventory_batch_id_fkey" FOREIGN KEY ("inventory_batch_id") REFERENCES "inventory_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wastage_logs" ADD CONSTRAINT "wastage_logs_inventory_batch_id_fkey" FOREIGN KEY ("inventory_batch_id") REFERENCES "inventory_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

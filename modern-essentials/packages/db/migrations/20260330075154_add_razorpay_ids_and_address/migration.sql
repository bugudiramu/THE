/*
  Warnings:

  - A unique constraint covering the columns `[razorpay_order_id]` on the table `orders` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "address_line_1" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "postal_code" TEXT,
ADD COLUMN     "razorpay_order_id" TEXT,
ADD COLUMN     "state" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "orders_razorpay_order_id_key" ON "orders"("razorpay_order_id");

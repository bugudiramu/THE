/*
  Warnings:

  - You are about to drop the column `product_id` on the `cart_items` table. All the data in the column will be lost.
  - You are about to drop the column `product_id` on the `farm_batches` table. All the data in the column will be lost.
  - You are about to drop the column `product_id` on the `inventory_batches` table. All the data in the column will be lost.
  - You are about to drop the column `product_id` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `sku` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `sub_price` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `subscription_items` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionId` on the `subscription_items` table. All the data in the column will be lost.
  - You are about to drop the column `product_id` on the `subscription_plans` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `product_id` on the `wastage_logs` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cart_id,variant_id,is_subscription]` on the table `cart_items` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[variant_id,frequency,amount,duration_months]` on the table `subscription_plans` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `variant_id` to the `cart_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variant_id` to the `farm_batches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variant_id` to the `inventory_batches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variant_id` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subscription_id` to the `subscription_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variant_id` to the `subscription_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variant_id` to the `subscription_plans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variant_id` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variant_id` to the `wastage_logs` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Partner" AS ENUM ('ZEPTO', 'BLINKIT', 'INSTAMART', 'FLIPKART');

-- DropForeignKey
ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_product_id_fkey";

-- DropForeignKey
ALTER TABLE "inventory_batches" DROP CONSTRAINT "inventory_batches_product_id_fkey";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_product_id_fkey";

-- DropForeignKey
ALTER TABLE "subscription_items" DROP CONSTRAINT "subscription_items_productId_fkey";

-- DropForeignKey
ALTER TABLE "subscription_items" DROP CONSTRAINT "subscription_items_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "subscription_plans" DROP CONSTRAINT "subscription_plans_product_id_fkey";

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_productId_fkey";

-- DropIndex
DROP INDEX "cart_items_cart_id_product_id_is_subscription_key";

-- DropIndex
DROP INDEX "inventory_batches_product_id_expires_at_idx";

-- DropIndex
DROP INDEX "products_sku_key";

-- DropIndex
DROP INDEX "subscription_plans_product_id_frequency_amount_key";

-- AlterTable
ALTER TABLE "cart_items" DROP COLUMN "product_id",
ADD COLUMN     "variant_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "farm_batches" DROP COLUMN "product_id",
ADD COLUMN     "variant_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "inventory_batches" DROP COLUMN "product_id",
ADD COLUMN     "variant_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "order_items" DROP COLUMN "product_id",
ADD COLUMN     "variant_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "price",
DROP COLUMN "sku",
DROP COLUMN "sub_price";

-- AlterTable
ALTER TABLE "subscription_items" DROP COLUMN "productId",
DROP COLUMN "subscriptionId",
ADD COLUMN     "subscription_id" TEXT NOT NULL,
ADD COLUMN     "variant_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "subscription_plans" DROP COLUMN "product_id",
ADD COLUMN     "billing_cycles" INTEGER,
ADD COLUMN     "duration_months" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "variant_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "productId",
ADD COLUMN     "variant_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "wastage_logs" DROP COLUMN "product_id",
ADD COLUMN     "variant_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "product_variants" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "pack_size" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "sub_price" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_partner_links" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "partner" "Partner" NOT NULL,
    "url" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "product_partner_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_sku_key" ON "product_variants"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "product_partner_links_product_id_partner_key" ON "product_partner_links"("product_id", "partner");

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_cart_id_variant_id_is_subscription_key" ON "cart_items"("cart_id", "variant_id", "is_subscription");

-- CreateIndex
CREATE INDEX "inventory_batches_variant_id_expires_at_idx" ON "inventory_batches"("variant_id", "expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_variant_id_frequency_amount_duration_mon_key" ON "subscription_plans"("variant_id", "frequency", "amount", "duration_months");

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_partner_links" ADD CONSTRAINT "product_partner_links_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_batches" ADD CONSTRAINT "inventory_batches_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_plans" ADD CONSTRAINT "subscription_plans_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_items" ADD CONSTRAINT "subscription_items_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_items" ADD CONSTRAINT "subscription_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

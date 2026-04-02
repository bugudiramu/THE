/*
  Warnings:

  - The values [DAILY] on the enum `SubscriptionFrequency` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SubscriptionFrequency_new" AS ENUM ('WEEKLY', 'FORTNIGHTLY', 'MONTHLY');
ALTER TABLE "subscriptions" ALTER COLUMN "frequency" DROP DEFAULT;
ALTER TABLE "subscriptions" ALTER COLUMN "frequency" TYPE "SubscriptionFrequency_new" USING ("frequency"::text::"SubscriptionFrequency_new");
ALTER TABLE "subscription_plans" ALTER COLUMN "frequency" TYPE "SubscriptionFrequency_new" USING ("frequency"::text::"SubscriptionFrequency_new");
ALTER TABLE "cart_items" ALTER COLUMN "frequency" TYPE "SubscriptionFrequency_new" USING ("frequency"::text::"SubscriptionFrequency_new");
ALTER TYPE "SubscriptionFrequency" RENAME TO "SubscriptionFrequency_old";
ALTER TYPE "SubscriptionFrequency_new" RENAME TO "SubscriptionFrequency";
DROP TYPE "SubscriptionFrequency_old";
ALTER TABLE "subscriptions" ALTER COLUMN "frequency" SET DEFAULT 'WEEKLY';
COMMIT;

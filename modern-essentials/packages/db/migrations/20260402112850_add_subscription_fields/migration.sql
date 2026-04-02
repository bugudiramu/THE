-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "cancel_reason" TEXT,
ADD COLUMN     "dunning_attempt" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pause_until" TIMESTAMP(3);

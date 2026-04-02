-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "address_line_1" TEXT,
ADD COLUMN     "address_line_2" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "postal_code" TEXT,
ADD COLUMN     "state" TEXT;

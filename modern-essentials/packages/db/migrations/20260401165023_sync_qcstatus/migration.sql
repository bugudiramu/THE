/*
  Warnings:

  - The values [PASS,REJECT] on the enum `QCStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "QCStatus_new" AS ENUM ('PENDING', 'PASSED', 'QUARANTINE', 'REJECTED');
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

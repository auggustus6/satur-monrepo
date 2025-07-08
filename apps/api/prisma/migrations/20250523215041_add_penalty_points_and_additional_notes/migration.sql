-- AlterTable
ALTER TABLE "CancellationReason" ADD COLUMN     "penaltyPoints" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "SupplierCancellation" ADD COLUMN     "additionalNotes" TEXT;

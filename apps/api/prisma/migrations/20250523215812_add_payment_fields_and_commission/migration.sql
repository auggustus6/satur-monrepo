/*
  Warnings:

  - Added the required column `updatedAt` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "description" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "platformFeeAmount" DOUBLE PRECISION,
ADD COLUMN     "platformFeePercentage" DOUBLE PRECISION NOT NULL DEFAULT 10,
ADD COLUMN     "supplierAmount" DOUBLE PRECISION,
ADD COLUMN     "transactionId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

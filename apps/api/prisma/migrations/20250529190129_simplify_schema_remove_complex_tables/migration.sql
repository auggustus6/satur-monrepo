/*
  Warnings:

  - You are about to drop the column `notes` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `platformFeeAmount` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `platformFeePercentage` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `requestId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `supplierAmount` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `transactionId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the `CancellationReason` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ServiceApplication` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ServiceRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SupplierCancellation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_requestId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_requestId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceApplication" DROP CONSTRAINT "ServiceApplication_requestId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceApplication" DROP CONSTRAINT "ServiceApplication_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceRequest" DROP CONSTRAINT "ServiceRequest_agencyId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceRequest" DROP CONSTRAINT "ServiceRequest_assignedSupplierId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceRequest" DROP CONSTRAINT "ServiceRequest_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "SupplierCancellation" DROP CONSTRAINT "SupplierCancellation_reasonId_fkey";

-- DropForeignKey
ALTER TABLE "SupplierCancellation" DROP CONSTRAINT "SupplierCancellation_requestId_fkey";

-- DropForeignKey
ALTER TABLE "SupplierCancellation" DROP CONSTRAINT "SupplierCancellation_supplierId_fkey";

-- DropIndex
DROP INDEX "Payment_requestId_key";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "notes",
DROP COLUMN "platformFeeAmount",
DROP COLUMN "platformFeePercentage",
DROP COLUMN "requestId",
DROP COLUMN "supplierAmount",
DROP COLUMN "transactionId";

-- DropTable
DROP TABLE "CancellationReason";

-- DropTable
DROP TABLE "Notification";

-- DropTable
DROP TABLE "ServiceApplication";

-- DropTable
DROP TABLE "ServiceRequest";

-- DropTable
DROP TABLE "SupplierCancellation";

-- DropEnum
DROP TYPE "ApplicationStatus";

-- DropEnum
DROP TYPE "NotificationType";

-- DropEnum
DROP TYPE "ServiceRequestStatus";

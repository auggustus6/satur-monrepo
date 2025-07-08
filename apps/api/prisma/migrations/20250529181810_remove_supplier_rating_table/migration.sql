/*
  Warnings:

  - You are about to drop the `SupplierRating` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SupplierRating" DROP CONSTRAINT "SupplierRating_requestId_fkey";

-- DropForeignKey
ALTER TABLE "SupplierRating" DROP CONSTRAINT "SupplierRating_supplierId_fkey";

-- DropTable
DROP TABLE "SupplierRating";

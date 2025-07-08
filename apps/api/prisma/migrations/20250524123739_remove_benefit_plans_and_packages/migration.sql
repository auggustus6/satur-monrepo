/*
  Warnings:

  - You are about to drop the `BenefitPlan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Package` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PackagePurchase` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BenefitPlan" DROP CONSTRAINT "BenefitPlan_companyId_fkey";

-- DropForeignKey
ALTER TABLE "PackagePurchase" DROP CONSTRAINT "PackagePurchase_agencyId_fkey";

-- DropForeignKey
ALTER TABLE "PackagePurchase" DROP CONSTRAINT "PackagePurchase_packageId_fkey";

-- DropTable
DROP TABLE "BenefitPlan";

-- DropTable
DROP TABLE "Package";

-- DropTable
DROP TABLE "PackagePurchase";

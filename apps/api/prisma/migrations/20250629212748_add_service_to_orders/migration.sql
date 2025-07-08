/*
  Warnings:

  - Added the required column `serviceId` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- Step 1: Add the column as nullable first
ALTER TABLE "orders" ADD COLUMN "serviceId" INTEGER;

-- Step 2: Populate serviceId based on productId
UPDATE "orders"
SET "serviceId" = (
  SELECT "serviceId"
  FROM "products"
  WHERE "products"."id" = "orders"."productId"
);

-- Step 3: Make the column NOT NULL
ALTER TABLE "orders" ALTER COLUMN "serviceId" SET NOT NULL;

-- Step 4: Add the foreign key constraint
ALTER TABLE "orders" ADD CONSTRAINT "orders_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

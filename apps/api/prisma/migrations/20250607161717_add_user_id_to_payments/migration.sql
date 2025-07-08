-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('CPF', 'CNPJ');

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "documentType" "DocumentType";

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

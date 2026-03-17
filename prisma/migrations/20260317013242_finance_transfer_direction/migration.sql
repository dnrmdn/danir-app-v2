-- CreateEnum
CREATE TYPE "FinanceTransferDirection" AS ENUM ('IN', 'OUT');

-- AlterTable
ALTER TABLE "finance_transaction" ADD COLUMN     "otherAccountId" INTEGER,
ADD COLUMN     "transferDirection" "FinanceTransferDirection";

-- AddForeignKey
ALTER TABLE "finance_transaction" ADD CONSTRAINT "finance_transaction_otherAccountId_fkey" FOREIGN KEY ("otherAccountId") REFERENCES "finance_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

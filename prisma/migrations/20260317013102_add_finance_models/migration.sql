-- CreateEnum
CREATE TYPE "FinanceAccountType" AS ENUM ('CASH', 'BANK', 'EWALLET');

-- CreateEnum
CREATE TYPE "FinanceTransactionType" AS ENUM ('INCOME', 'EXPENSE', 'TRANSFER');

-- CreateEnum
CREATE TYPE "FinanceCategoryKind" AS ENUM ('INCOME', 'EXPENSE');

-- CreateTable
CREATE TABLE "finance_account" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FinanceAccountType" NOT NULL,
    "currency" TEXT NOT NULL,
    "initialBalance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "finance_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance_category" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "FinanceCategoryKind" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "finance_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance_tag" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "finance_tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance_transaction" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" INTEGER NOT NULL,
    "type" "FinanceTransactionType" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "categoryId" INTEGER,
    "transferGroup" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "finance_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance_transaction_tag" (
    "id" SERIAL NOT NULL,
    "transactionId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    CONSTRAINT "finance_transaction_tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance_budget" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "month" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "limit" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "finance_budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance_goal" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "targetAmount" DECIMAL(65,30) NOT NULL,
    "currentAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "targetDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "finance_goal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "finance_account_userId_name_key" ON "finance_account"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "finance_category_userId_name_kind_key" ON "finance_category"("userId", "name", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "finance_tag_userId_name_key" ON "finance_tag"("userId", "name");

-- CreateIndex
CREATE INDEX "finance_transaction_userId_date_idx" ON "finance_transaction"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "finance_transaction_tag_transactionId_tagId_key" ON "finance_transaction_tag"("transactionId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "finance_budget_userId_categoryId_month_currency_key" ON "finance_budget"("userId", "categoryId", "month", "currency");

-- AddForeignKey
ALTER TABLE "finance_account" ADD CONSTRAINT "finance_account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_category" ADD CONSTRAINT "finance_category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_tag" ADD CONSTRAINT "finance_tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_transaction" ADD CONSTRAINT "finance_transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_transaction" ADD CONSTRAINT "finance_transaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "finance_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_transaction" ADD CONSTRAINT "finance_transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "finance_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_transaction_tag" ADD CONSTRAINT "finance_transaction_tag_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "finance_transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_transaction_tag" ADD CONSTRAINT "finance_transaction_tag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "finance_tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_budget" ADD CONSTRAINT "finance_budget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_budget" ADD CONSTRAINT "finance_budget_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "finance_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_goal" ADD CONSTRAINT "finance_goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

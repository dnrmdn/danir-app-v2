-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'SNACK', 'LUNCH', 'DINNER');

-- CreateEnum
CREATE TYPE "FinanceAccountType" AS ENUM ('CASH', 'BANK', 'EWALLET');

-- CreateEnum
CREATE TYPE "FinanceTransactionType" AS ENUM ('INCOME', 'EXPENSE', 'TRANSFER');

-- CreateEnum
CREATE TYPE "FinanceTransferDirection" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "FinanceCategoryKind" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "FinanceCategoryClassification" AS ENUM ('NEED', 'WANT', 'INVESTMENT', 'SAVING', 'DEBT', 'TAX', 'OTHER');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "username" TEXT,
    "bio" TEXT,
    "phone" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_link" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "label" TEXT,
    "previewImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_plan_week" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStart" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meal_plan_week_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_plan_entry" (
    "id" SERIAL NOT NULL,
    "weekId" INTEGER NOT NULL,
    "dayIndex" INTEGER NOT NULL,
    "mealType" "MealType" NOT NULL,
    "text" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meal_plan_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance_account" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FinanceAccountType" NOT NULL,
    "currency" TEXT NOT NULL,
    "initialBalance" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "balance" DECIMAL(18,2) NOT NULL DEFAULT 0,
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
    "parentId" INTEGER,
    "classification" "FinanceCategoryClassification",
    "icon" TEXT,
    "color" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
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
    "transferDirection" "FinanceTransferDirection",
    "otherAccountId" INTEGER,
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

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bgColor" TEXT NOT NULL,
    "taskColor" TEXT NOT NULL,
    "taskColorDone" TEXT NOT NULL,
    "iconColor" TEXT NOT NULL,
    "checkColor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task" (
    "id" SERIAL NOT NULL,
    "memberId" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "reward" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward" (
    "id" SERIAL NOT NULL,
    "memberId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "minStars" INTEGER NOT NULL,
    "image" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_claim" (
    "id" SERIAL NOT NULL,
    "memberId" INTEGER NOT NULL,
    "rewardId" INTEGER NOT NULL,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reward_claim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "saved_link_userId_url_key" ON "saved_link"("userId", "url");

-- CreateIndex
CREATE UNIQUE INDEX "meal_plan_week_userId_weekStart_key" ON "meal_plan_week"("userId", "weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "meal_plan_entry_weekId_dayIndex_mealType_sortOrder_key" ON "meal_plan_entry"("weekId", "dayIndex", "mealType", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "finance_account_userId_name_key" ON "finance_account"("userId", "name");

-- CreateIndex
CREATE INDEX "finance_category_userId_kind_idx" ON "finance_category"("userId", "kind");

-- CreateIndex
CREATE INDEX "finance_category_parentId_idx" ON "finance_category"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "finance_category_userId_name_kind_parentId_key" ON "finance_category"("userId", "name", "kind", "parentId");

-- CreateIndex
CREATE UNIQUE INDEX "finance_tag_userId_name_key" ON "finance_tag"("userId", "name");

-- CreateIndex
CREATE INDEX "finance_transaction_userId_date_idx" ON "finance_transaction"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "finance_transaction_tag_transactionId_tagId_key" ON "finance_transaction_tag"("transactionId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "finance_budget_userId_categoryId_month_currency_key" ON "finance_budget"("userId", "categoryId", "month", "currency");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "account_userId_providerId_key" ON "account"("userId", "providerId");

-- AddForeignKey
ALTER TABLE "saved_link" ADD CONSTRAINT "saved_link_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_plan_week" ADD CONSTRAINT "meal_plan_week_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_plan_entry" ADD CONSTRAINT "meal_plan_entry_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "meal_plan_week"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_account" ADD CONSTRAINT "finance_account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_category" ADD CONSTRAINT "finance_category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_category" ADD CONSTRAINT "finance_category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "finance_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_tag" ADD CONSTRAINT "finance_tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_transaction" ADD CONSTRAINT "finance_transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_transaction" ADD CONSTRAINT "finance_transaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "finance_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_transaction" ADD CONSTRAINT "finance_transaction_otherAccountId_fkey" FOREIGN KEY ("otherAccountId") REFERENCES "finance_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward" ADD CONSTRAINT "reward_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_claim" ADD CONSTRAINT "reward_claim_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_claim" ADD CONSTRAINT "reward_claim_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "reward"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

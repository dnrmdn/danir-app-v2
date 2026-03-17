-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'SNACK', 'LUNCH', 'DINNER');

-- CreateTable
CREATE TABLE "meal_plan_week" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
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

-- CreateIndex
CREATE UNIQUE INDEX "meal_plan_week_userId_weekStart_key" ON "meal_plan_week"("userId", "weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "meal_plan_entry_weekId_dayIndex_mealType_sortOrder_key" ON "meal_plan_entry"("weekId", "dayIndex", "mealType", "sortOrder");

-- AddForeignKey
ALTER TABLE "meal_plan_week" ADD CONSTRAINT "meal_plan_week_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_plan_entry" ADD CONSTRAINT "meal_plan_entry_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "meal_plan_week"("id") ON DELETE CASCADE ON UPDATE CASCADE;

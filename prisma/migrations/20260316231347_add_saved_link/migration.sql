/*
  Warnings:

  - You are about to drop the column `userId` on the `reward` table. All the data in the column will be lost.
  - Added the required column `memberId` to the `reward` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."reward" DROP CONSTRAINT "reward_userId_fkey";

-- AlterTable
ALTER TABLE "reward" DROP COLUMN "userId",
ADD COLUMN     "memberId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "saved_link" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "label" TEXT,
    "description" TEXT,
    "previewImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_link_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "saved_link" ADD CONSTRAINT "saved_link_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward" ADD CONSTRAINT "reward_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

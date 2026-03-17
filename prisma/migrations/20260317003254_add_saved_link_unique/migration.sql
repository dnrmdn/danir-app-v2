/*
  Warnings:

  - A unique constraint covering the columns `[userId,url]` on the table `saved_link` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "saved_link_userId_url_key" ON "saved_link"("userId", "url");

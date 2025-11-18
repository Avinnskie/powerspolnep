/*
  Warnings:

  - You are about to drop the column `divisi` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[memberCode]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "divisi",
ADD COLUMN     "memberCode" TEXT,
ADD COLUMN     "powersDivisionId" TEXT;

-- CreateTable
CREATE TABLE "powers_divisions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "headId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "powers_divisions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "powers_divisions_name_key" ON "powers_divisions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "powers_divisions_headId_key" ON "powers_divisions"("headId");

-- CreateIndex
CREATE UNIQUE INDEX "users_memberCode_key" ON "users"("memberCode");

-- AddForeignKey
ALTER TABLE "powers_divisions" ADD CONSTRAINT "powers_divisions_headId_fkey" FOREIGN KEY ("headId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_powersDivisionId_fkey" FOREIGN KEY ("powersDivisionId") REFERENCES "powers_divisions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `photo` on the `gyms` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "gyms" DROP COLUMN "photo",
ADD COLUMN     "phone" TEXT;

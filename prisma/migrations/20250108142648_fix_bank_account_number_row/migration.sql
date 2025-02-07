/*
  Warnings:

  - You are about to drop the column `banckAccountNumber` on the `owner` table. All the data in the column will be lost.
  - Added the required column `bankAccountNumber` to the `Owner` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `owner` DROP COLUMN `banckAccountNumber`,
    ADD COLUMN `bankAccountNumber` VARCHAR(191) NOT NULL;

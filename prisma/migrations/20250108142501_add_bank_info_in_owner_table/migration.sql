/*
  Warnings:

  - Added the required column `banckAccountNumber` to the `Owner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bankAgency` to the `Owner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bankName` to the `Owner` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `owner` ADD COLUMN `banckAccountNumber` VARCHAR(191) NOT NULL,
    ADD COLUMN `bankAgency` VARCHAR(191) NOT NULL,
    ADD COLUMN `bankName` VARCHAR(191) NOT NULL;

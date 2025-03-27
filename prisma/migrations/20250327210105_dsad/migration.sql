/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `venue` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `proposal` ADD COLUMN `cnpj` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `venue` ADD COLUMN `email` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `venue_email_key` ON `venue`(`email`);

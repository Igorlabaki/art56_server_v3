/*
  Warnings:

  - You are about to drop the column `area` on the `image` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `image` DROP COLUMN `area`,
    ADD COLUMN `description` VARCHAR(191) NULL;

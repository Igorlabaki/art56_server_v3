/*
  Warnings:

  - Added the required column `teste` to the `Image` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `image` ADD COLUMN `teste` VARCHAR(191) NOT NULL;

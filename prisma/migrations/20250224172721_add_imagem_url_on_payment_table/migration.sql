/*
  Warnings:

  - Added the required column `imagemUrl` to the `payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `payment` ADD COLUMN `imagemUrl` VARCHAR(191) NOT NULL;

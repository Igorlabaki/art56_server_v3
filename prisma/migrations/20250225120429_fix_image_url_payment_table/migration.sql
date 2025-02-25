/*
  Warnings:

  - You are about to drop the column `imagemUrl` on the `payment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `payment` DROP COLUMN `imagemUrl`,
    ADD COLUMN `imageUrl` VARCHAR(191) NULL;

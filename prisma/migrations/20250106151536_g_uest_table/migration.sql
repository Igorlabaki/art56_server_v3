/*
  Warnings:

  - You are about to drop the column `guests` on the `proposal` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `proposal` DROP COLUMN `guests`;

-- CreateTable
CREATE TABLE `Guest` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `proposalId` VARCHAR(191) NOT NULL,

    INDEX `Guest_proposalId_idx`(`proposalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

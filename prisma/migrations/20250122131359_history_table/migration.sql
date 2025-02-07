/*
  Warnings:

  - Added the required column `maxGuest` to the `Venue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `venue` ADD COLUMN `maxGuest` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `history` (
    `id` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `proposalId` VARCHAR(191) NOT NULL,

    INDEX `history_userId_idx`(`userId`),
    INDEX `history_proposalId_idx`(`proposalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

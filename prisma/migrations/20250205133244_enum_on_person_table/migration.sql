/*
  Warnings:

  - You are about to drop the `guest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `guest`;

-- CreateTable
CREATE TABLE `Person` (
    `id` VARCHAR(191) NOT NULL,
    `attendance` BOOLEAN NOT NULL DEFAULT false,
    `type` ENUM('GUEST', 'WORKER') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `rg` VARCHAR(191) NULL,
    `proposalId` VARCHAR(191) NOT NULL,

    INDEX `Person_proposalId_idx`(`proposalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

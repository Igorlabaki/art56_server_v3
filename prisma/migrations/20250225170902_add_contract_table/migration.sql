/*
  Warnings:

  - Added the required column `contractId` to the `Clause` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `clause` ADD COLUMN `contractId` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `Contract` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Clause_contractId_idx` ON `Clause`(`contractId`);

/*
  Warnings:

  - You are about to drop the column `venueId` on the `contract` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `contract_venueId_idx` ON `contract`;

-- AlterTable
ALTER TABLE `contract` DROP COLUMN `venueId`;

-- CreateTable
CREATE TABLE `_ContractVenues` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ContractVenues_AB_unique`(`A`, `B`),
    INDEX `_ContractVenues_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

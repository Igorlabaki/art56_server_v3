/*
  Warnings:

  - You are about to drop the column `contractId` on the `clause` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `clause_contractId_idx` ON `clause`;

-- AlterTable
ALTER TABLE `clause` DROP COLUMN `contractId`;

-- CreateTable
CREATE TABLE `_ContractClauses` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ContractClauses_AB_unique`(`A`, `B`),
    INDEX `_ContractClauses_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

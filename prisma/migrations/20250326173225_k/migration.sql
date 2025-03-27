/*
  Warnings:

  - Added the required column `venueId` to the `contract` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `contract` ADD COLUMN `venueId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `contract_venueId_idx` ON `contract`(`venueId`);

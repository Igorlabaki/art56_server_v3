/*
  Warnings:

  - Added the required column `venueId` to the `proposal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `proposal` ADD COLUMN `venueId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `proposal_venueId_idx` ON `proposal`(`venueId`);

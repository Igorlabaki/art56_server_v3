/*
  Warnings:

  - You are about to drop the column `venueId` on the `proposal` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `proposal_venueId_idx` ON `proposal`;

-- AlterTable
ALTER TABLE `proposal` DROP COLUMN `venueId`;

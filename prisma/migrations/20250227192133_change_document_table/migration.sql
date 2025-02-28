/*
  Warnings:

  - You are about to drop the column `venueId` on the `document` table. All the data in the column will be lost.
  - Added the required column `proposalId` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Document_venueId_idx` ON `document`;

-- AlterTable
ALTER TABLE `document` DROP COLUMN `venueId`,
    ADD COLUMN `proposalId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `Document_proposalId_idx` ON `Document`(`proposalId`);

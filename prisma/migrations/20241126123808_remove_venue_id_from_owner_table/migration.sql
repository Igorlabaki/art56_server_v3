/*
  Warnings:

  - Added the required column `organizationId` to the `Owner` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Owner_venueId_idx` ON `owner`;

-- AlterTable
ALTER TABLE `owner` ADD COLUMN `organizationId` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `_VenueOwners` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_VenueOwners_AB_unique`(`A`, `B`),
    INDEX `_VenueOwners_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Owner_organizationId_idx` ON `Owner`(`organizationId`);

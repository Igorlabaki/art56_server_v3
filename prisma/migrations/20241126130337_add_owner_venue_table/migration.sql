/*
  Warnings:

  - You are about to drop the `_venueowners` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `_venueowners`;

-- CreateTable
CREATE TABLE `OwnerVenue` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `venueId` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'ADMIN',
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `OwnerVenue_venueId_idx`(`venueId`),
    UNIQUE INDEX `OwnerVenue_ownerId_venueId_key`(`ownerId`, `venueId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

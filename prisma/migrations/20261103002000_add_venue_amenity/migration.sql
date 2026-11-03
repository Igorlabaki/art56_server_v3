-- CreateTable
CREATE TABLE `venue_amenity` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `position` INTEGER NOT NULL DEFAULT 0,
    `venueId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `venue_amenity_venueId_idx`(`venueId`),
    UNIQUE INDEX `venue_amenity_name_venueId_key`(`name`, `venueId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

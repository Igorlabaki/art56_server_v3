-- Already applied on PlanetScale main by deploy request 48; do not reapply there.
-- CreateTable
CREATE TABLE `venue_amenity_image` (
    `id` VARCHAR(191) NOT NULL,
    `amenityId` VARCHAR(191) NOT NULL,
    `imageUrl` TEXT NOT NULL,
    `position` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `venue_amenity_image_amenityId_idx`(`amenityId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

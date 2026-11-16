-- Already applied on PlanetScale main by deploy request 50; do not reapply there.
-- Additive only: CREATE TABLE and ALTER TABLE ... ADD. No physical foreign keys
-- (relationMode = prisma).

-- CreateTable
CREATE TABLE `venue_photo` (
    `id` VARCHAR(191) NOT NULL,
    `venueId` VARCHAR(191) NOT NULL,
    `url` VARCHAR(1024) NOT NULL,
    `storageKey` VARCHAR(512) NOT NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `sizeBytes` INTEGER NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `venue_photo_venueId_idx`(`venueId`),
    INDEX `venue_photo_venueId_url_idx`(`venueId`, `url`(191)),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `image` ADD COLUMN `photoId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `image_photoId_idx` ON `image`(`photoId`);

-- AlterTable
ALTER TABLE `service` ADD COLUMN `photoId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `service_photoId_idx` ON `service`(`photoId`);

-- AlterTable
ALTER TABLE `venue_amenity_image` ADD COLUMN `photoId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `venue_amenity_image_photoId_idx` ON `venue_amenity_image`(`photoId`);

-- AlterTable
ALTER TABLE `emailConfig` ADD COLUMN `backgroundPhotoId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `emailConfig_backgroundPhotoId_idx` ON `emailConfig`(`backgroundPhotoId`);

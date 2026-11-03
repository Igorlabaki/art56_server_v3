-- CreateTable
CREATE TABLE `venue_rule` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(120) NULL,
    `text` LONGTEXT NOT NULL,
    `position` INTEGER NOT NULL DEFAULT 0,
    `venueId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `venue_rule_venueId_idx`(`venueId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

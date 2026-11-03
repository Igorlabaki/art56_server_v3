-- CreateTable
CREATE TABLE `minimum_price_period` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `startDay` VARCHAR(191) NOT NULL,
    `endDay` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `venueId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `minimum_price_period_venueId_idx`(`venueId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

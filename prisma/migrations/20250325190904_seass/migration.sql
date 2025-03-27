-- CreateTable
CREATE TABLE `SeasonalFee` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `endDay` DATETIME(3) NOT NULL,
    `startDay` DATETIME(3) NOT NULL,
    `fee` INTEGER NOT NULL,
    `venueId` VARCHAR(191) NOT NULL,

    INDEX `SeasonalFee_venueId_idx`(`venueId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

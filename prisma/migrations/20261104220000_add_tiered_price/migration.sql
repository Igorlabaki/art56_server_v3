-- AlterTable
ALTER TABLE `venue`
    MODIFY `pricingModel` ENUM('PER_PERSON', 'PER_DAY', 'PER_PERSON_DAY', 'PER_PERSON_HOUR', 'TIERED') NOT NULL;

-- CreateTable
CREATE TABLE `tiered_price` (
    `id` VARCHAR(191) NOT NULL,
    `venueId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `tiered_price_venueId_key`(`venueId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tier` (
    `id` VARCHAR(191) NOT NULL,
    `tieredPriceId` VARCHAR(191) NOT NULL,
    `minGuests` INTEGER NOT NULL,
    `maxGuests` INTEGER NOT NULL,
    `price` DOUBLE NOT NULL,

    INDEX `tier_tieredPriceId_idx`(`tieredPriceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

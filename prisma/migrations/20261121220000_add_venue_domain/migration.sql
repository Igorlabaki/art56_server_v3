-- Already applied on PlanetScale main by deploy request 55; do not reapply there.
-- Additive only: CREATE TABLE. No physical foreign keys (relationMode = prisma).
-- Do not attach www.ar756.com.

-- CreateTable
CREATE TABLE `venue_domain` (
    `id` VARCHAR(191) NOT NULL,
    `venueId` VARCHAR(191) NOT NULL,
    `hostname` VARCHAR(253) NOT NULL,
    `status` ENUM('PENDING', 'ACTIVE', 'REMOVED') NOT NULL,
    `verificationType` VARCHAR(32) NULL,
    `verificationName` VARCHAR(255) NULL,
    `verificationValue` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `activatedAt` DATETIME(3) NULL,

    UNIQUE INDEX `venue_domain_hostname_key`(`hostname`),
    INDEX `venue_domain_venueId_idx`(`venueId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

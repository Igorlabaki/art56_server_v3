-- AlterTable
ALTER TABLE `dataEvent` ADD COLUMN `googleEventId` VARCHAR(191) NULL,
    ADD COLUMN `googleCalendarId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `google_calendar_integration` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `googleCalendarId` VARCHAR(191) NULL,
    `accessTokenEncrypted` VARCHAR(191) NOT NULL,
    `refreshTokenEncrypted` VARCHAR(191) NOT NULL,
    `scope` VARCHAR(191) NOT NULL,
    `tokenExpiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `google_calendar_integration_userId_organizationId_key`(`userId`, `organizationId`),
    INDEX `google_calendar_integration_userId_idx`(`userId`),
    INDEX `google_calendar_integration_organizationId_idx`(`organizationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Already applied on PlanetScale main by deploy request 53; do not reapply there.
-- Additive only: CREATE TABLE. No physical foreign keys (relationMode = prisma).

CREATE TABLE `venue_link` (
    `id` VARCHAR(191) NOT NULL,
    `venueId` VARCHAR(191) NOT NULL,
    `kind` ENUM('PRESENTATION', 'BUDGET_FORM', 'RULES', 'WHATSAPP', 'EMAIL', 'GOOGLE_MAPS', 'TOUR_VIDEO', 'ORGANIZATION_SITE', 'SITE', 'INSTAGRAM', 'FACEBOOK', 'TIKTOK', 'YOUTUBE', 'GOOGLE_BUSINESS', 'PINTEREST', 'LINKEDIN', 'TRIPADVISOR', 'AIRBNB', 'MENU') NOT NULL,
    `url` VARCHAR(2048) NULL,
    `visible` BOOLEAN NOT NULL DEFAULT false,
    `position` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `venue_link_venueId_kind_key`(`venueId`, `kind`),
    INDEX `venue_link_venueId_idx`(`venueId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

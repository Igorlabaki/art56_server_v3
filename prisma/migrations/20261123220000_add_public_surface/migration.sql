-- Applied on PlanetScale main by deploy request 56. Additive only: CREATE TABLE.
-- No physical foreign keys (relationMode = prisma). No backfill.

CREATE TABLE `public_surface_daily` (
    `id` VARCHAR(191) NOT NULL,
    `venueId` VARCHAR(191) NOT NULL,
    `day` DATE NOT NULL,
    `subject` VARCHAR(32) NOT NULL,
    `opens` INTEGER NOT NULL DEFAULT 0,
    `clicks` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `public_surface_daily_venueId_day_subject_key`(`venueId`, `day`, `subject`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `public_surface_visitor` (
    `id` VARCHAR(191) NOT NULL,
    `venueId` VARCHAR(191) NOT NULL,
    `month` VARCHAR(7) NOT NULL,
    `surface` VARCHAR(16) NOT NULL,
    `visitorKey` VARCHAR(64) NOT NULL,

    UNIQUE INDEX `public_surface_visitor_venueId_month_surface_visitorKey_key`(`venueId`, `month`, `surface`, `visitorKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

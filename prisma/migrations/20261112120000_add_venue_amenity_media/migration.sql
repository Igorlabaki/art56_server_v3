-- Already applied on PlanetScale main by deploy request 43; do not reapply there.
-- AlterTable
ALTER TABLE `venue_amenity` ADD COLUMN `description` VARCHAR(500) NULL,
    ADD COLUMN `imageUrl` TEXT NULL,
    ADD COLUMN `videoUrl` VARCHAR(2048) NULL;

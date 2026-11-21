-- Additive. Existing venues keep a null icon and the EventHub favicon.
-- Do not apply on PlanetScale main without a named approval.

ALTER TABLE `venue` ADD COLUMN `faviconUrl` VARCHAR(191) NULL;

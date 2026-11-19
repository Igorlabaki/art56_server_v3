-- Additive. The UPDATE copies the current description into slogan once.
-- A second run skips rows whose slogan was already set, including a later edit.
-- Do not apply on PlanetScale main without a named approval.
-- Deploy request applies the ADD COLUMN. The UPDATE is a separate approved write.

ALTER TABLE `venue` ADD COLUMN `slogan` TEXT NULL;

UPDATE `venue`
SET `slogan` = `description`
WHERE `slogan` IS NULL
  AND `description` IS NOT NULL
  AND TRIM(`description`) <> '';

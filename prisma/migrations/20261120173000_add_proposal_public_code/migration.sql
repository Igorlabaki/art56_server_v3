-- Additive. Existing proposals stay without a code and keep opening by id.
-- Do not apply on PlanetScale main without a named approval.

ALTER TABLE `proposal` ADD COLUMN `publicCode` CHAR(8) NULL;

CREATE UNIQUE INDEX `proposal_publicCode_key` ON `proposal`(`publicCode`);

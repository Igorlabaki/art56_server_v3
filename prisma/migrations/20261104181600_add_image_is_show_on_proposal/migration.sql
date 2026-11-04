-- AlterTable
ALTER TABLE `image` ADD COLUMN `isShowOnProposal` BOOLEAN NULL DEFAULT false;

-- Backfill: fotos que ja entram no link permanecem marcadas. Nao altera isShowOnOrganization.
UPDATE `image` SET `isShowOnProposal` = true WHERE `isShowOnOrganization` = true;

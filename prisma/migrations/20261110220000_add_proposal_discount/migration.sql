-- AlterTable
ALTER TABLE `proposal` ADD COLUMN `discountPercent` DOUBLE NOT NULL DEFAULT 0;
ALTER TABLE `proposal` ADD COLUMN `discountAmount` DOUBLE NOT NULL DEFAULT 0;

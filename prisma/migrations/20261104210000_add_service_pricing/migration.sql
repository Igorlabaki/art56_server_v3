-- AlterTable
ALTER TABLE `service`
    ADD COLUMN `pricingType` ENUM('FIXED', 'PER_HOUR', 'PER_PERSON') NOT NULL DEFAULT 'FIXED',
    ADD COLUMN `description` VARCHAR(500) NULL,
    ADD COLUMN `imageUrl` TEXT NULL;

-- AlterTable
ALTER TABLE `proposalService`
    ADD COLUMN `pricingType` ENUM('FIXED', 'PER_HOUR', 'PER_PERSON') NULL,
    ADD COLUMN `unitPrice` DOUBLE NULL,
    ADD COLUMN `quantity` INTEGER NULL,
    ADD COLUMN `amount` DOUBLE NULL;

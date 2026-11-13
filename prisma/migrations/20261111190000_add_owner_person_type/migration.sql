-- AlterTable
ALTER TABLE `owner` ADD COLUMN `personType` ENUM('PF', 'PJ') NOT NULL DEFAULT 'PF',
    ADD COLUMN `companyName` VARCHAR(191) NULL,
    ADD COLUMN `cnpj` VARCHAR(191) NULL,
    ADD COLUMN `companySize` ENUM('MEI', 'ME', 'EPP', 'DEMAIS') NULL;

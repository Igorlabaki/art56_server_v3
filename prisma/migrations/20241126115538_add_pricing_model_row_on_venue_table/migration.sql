/*
  Warnings:

  - Added the required column `pricingModel` to the `Venue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `venue` ADD COLUMN `pricePerDay` DOUBLE NULL,
    ADD COLUMN `pricePerPerson` DOUBLE NULL,
    ADD COLUMN `pricingModel` ENUM('PER_PERSON', 'PER_DAY') NOT NULL;

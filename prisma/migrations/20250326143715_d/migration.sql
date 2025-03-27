/*
  Warnings:

  - Added the required column `type` to the `SeasonalFee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `seasonalfee` ADD COLUMN `affectedDays` VARCHAR(191) NULL,
    ADD COLUMN `type` ENUM('SURCHARGE', 'DISCOUNT') NOT NULL,
    MODIFY `endDay` VARCHAR(191) NULL,
    MODIFY `startDay` VARCHAR(191) NULL;

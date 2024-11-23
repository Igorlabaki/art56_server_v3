/*
  Warnings:

  - Added the required column `cep` to the `Owner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cep` to the `Venue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `owner` ADD COLUMN `cep` VARCHAR(191) NOT NULL,
    MODIFY `rg` VARCHAR(191) NULL,
    MODIFY `complement` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `venue` ADD COLUMN `cep` VARCHAR(191) NOT NULL;

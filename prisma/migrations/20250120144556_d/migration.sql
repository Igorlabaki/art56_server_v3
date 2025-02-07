/*
  Warnings:

  - Added the required column `teste` to the `proposalCost` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `proposalcost` ADD COLUMN `teste` VARCHAR(191) NOT NULL;

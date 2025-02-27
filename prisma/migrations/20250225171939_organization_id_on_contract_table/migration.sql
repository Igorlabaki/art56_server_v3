/*
  Warnings:

  - Added the required column `organizationId` to the `Contract` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `contract` ADD COLUMN `organizationId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `Contract_organizationId_idx` ON `Contract`(`organizationId`);

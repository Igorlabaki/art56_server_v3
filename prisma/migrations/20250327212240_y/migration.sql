/*
  Warnings:

  - You are about to drop the column `name` on the `proposal` table. All the data in the column will be lost.
  - Made the column `completeClientName` on table `proposal` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX `proposal_name_startDate_idx` ON `proposal`;

-- AlterTable
ALTER TABLE `proposal` DROP COLUMN `name`,
    MODIFY `completeClientName` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `proposal_completeClientName_startDate_idx` ON `proposal`(`completeClientName`, `startDate`);

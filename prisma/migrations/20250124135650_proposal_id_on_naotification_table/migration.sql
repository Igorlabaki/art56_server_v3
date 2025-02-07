-- AlterTable
ALTER TABLE `notification` ADD COLUMN `proposalId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Notification_proposalId_idx` ON `Notification`(`proposalId`);

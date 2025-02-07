-- AlterTable
ALTER TABLE `history` ADD COLUMN `userId` VARCHAR(191) NULL,
    ADD COLUMN `username` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `History_userId_idx` ON `History`(`userId`);

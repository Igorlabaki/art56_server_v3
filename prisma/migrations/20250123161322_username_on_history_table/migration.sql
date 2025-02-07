-- AlterTable
ALTER TABLE `history` ADD COLUMN `username` VARCHAR(191) NULL,
    MODIFY `userId` VARCHAR(191) NULL;

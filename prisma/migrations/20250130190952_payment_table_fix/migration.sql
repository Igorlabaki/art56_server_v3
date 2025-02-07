/*
  Warnings:

  - You are about to drop the column `status` on the `payment` table. All the data in the column will be lost.
  - Added the required column `venueId` to the `payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `payment` DROP COLUMN `status`,
    ADD COLUMN `venueId` VARCHAR(191) NOT NULL,
    MODIFY `paymentMethod` ENUM('PIX', 'CREDIT_CARD', 'BANK_TRANSFER') NULL;

-- CreateIndex
CREATE INDEX `payment_venueId_idx` ON `payment`(`venueId`);

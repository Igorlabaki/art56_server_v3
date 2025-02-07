/*
  Warnings:

  - The values [ALERT] on the enum `Notification_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `dateevent` MODIFY `type` ENUM('VISIT', 'EVENT', 'OTHER', 'BARTER', 'PROPOSAL', 'OVERNIGHT', 'PRODUCTION') NOT NULL;

-- AlterTable
ALTER TABLE `notification` MODIFY `type` ENUM('VISIT', 'EVENT', 'OTHER', 'BARTER', 'PROPOSAL', 'OVERNIGHT', 'PRODUCTION') NOT NULL;

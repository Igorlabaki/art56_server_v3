-- AlterTable
ALTER TABLE `dateevent` MODIFY `type` ENUM('VISIT', 'EVENT', 'BARTER', 'OVERNIGHT', 'OTHER') NOT NULL;

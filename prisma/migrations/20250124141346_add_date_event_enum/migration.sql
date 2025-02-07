/*
  Warnings:

  - You are about to alter the column `type` on the `dateevent` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(8))`.

*/
-- AlterTable
ALTER TABLE `dateevent` MODIFY `type` ENUM('VISIT', 'EVENT', 'OVERNIGHT', 'OTHER') NOT NULL;

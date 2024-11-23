/*
  Warnings:

  - You are about to drop the column `cleaning` on the `proposal` table. All the data in the column will be lost.
  - You are about to drop the column `receptionist` on the `proposal` table. All the data in the column will be lost.
  - You are about to drop the column `security` on the `proposal` table. All the data in the column will be lost.
  - You are about to drop the `_pricetoproposal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `price` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `proposal` DROP COLUMN `cleaning`,
    DROP COLUMN `receptionist`,
    DROP COLUMN `security`;

-- DropTable
DROP TABLE `_pricetoproposal`;

-- DropTable
DROP TABLE `price`;

-- CreateIndex
CREATE INDEX `ProposalService_serviceId_idx` ON `ProposalService`(`serviceId`);

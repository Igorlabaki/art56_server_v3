/*
  Warnings:

  - You are about to drop the column `userId` on the `history` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `history` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `History_userId_idx` ON `history`;

-- AlterTable
ALTER TABLE `history` DROP COLUMN `userId`,
    DROP COLUMN `username`;

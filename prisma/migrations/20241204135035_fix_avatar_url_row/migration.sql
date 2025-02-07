/*
  Warnings:

  - You are about to drop the column `avatrUrl` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `avatrUrl`,
    ADD COLUMN `avatarUrl` VARCHAR(191) NULL;

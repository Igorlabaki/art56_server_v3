/*
  Warnings:

  - Added the required column `description` to the `Schedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `schedule` ADD COLUMN `description` LONGTEXT NOT NULL;

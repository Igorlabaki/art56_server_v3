/*
  Warnings:

  - Added the required column `guestNumber` to the `proposal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `proposal` ADD COLUMN `guestNumber` INTEGER NOT NULL;

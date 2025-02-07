/*
  Warnings:

  - Added the required column `hasOvernightStay` to the `Venue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `venue` ADD COLUMN `hasOvernightStay` BOOLEAN NOT NULL;

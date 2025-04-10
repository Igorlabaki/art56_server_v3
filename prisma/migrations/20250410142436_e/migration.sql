/*
  Warnings:

  - Added the required column `months` to the `Goal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `goal` ADD COLUMN `months` VARCHAR(191) NOT NULL;

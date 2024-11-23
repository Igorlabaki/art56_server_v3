/*
  Warnings:

  - You are about to drop the column `neibehood` on the `owner` table. All the data in the column will be lost.
  - Added the required column `neighborhood` to the `Owner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `Venue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `complement` to the `Venue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `neighborhood` to the `Venue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Venue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `street` to the `Venue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `streetNumber` to the `Venue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `owner` DROP COLUMN `neibehood`,
    ADD COLUMN `neighborhood` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `venue` ADD COLUMN `city` VARCHAR(191) NOT NULL,
    ADD COLUMN `complement` VARCHAR(191) NOT NULL,
    ADD COLUMN `neighborhood` VARCHAR(191) NOT NULL,
    ADD COLUMN `state` VARCHAR(191) NOT NULL,
    ADD COLUMN `street` VARCHAR(191) NOT NULL,
    ADD COLUMN `streetNumber` VARCHAR(191) NOT NULL;

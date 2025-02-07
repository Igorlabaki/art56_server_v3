/*
  Warnings:

  - The values [OUTROS,AMIGO] on the enum `proposal_trafficSource` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `proposal` MODIFY `trafficSource` ENUM('AIRBNB', 'GOOGLE', 'INSTAGRAM', 'TIKTOK', 'OTHER', 'FRIEND', 'FACEBOOK') NOT NULL;

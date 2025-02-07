/*
  Warnings:

  - The values [RECURRING] on the enum `expense_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `expense` MODIFY `type` ENUM('WEEKLY', 'ANNUAL', 'MONTHLY', 'BIWEEKLY', 'SPORADIC') NOT NULL;

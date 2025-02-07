/*
  Warnings:

  - The values [BANK_TRANSFER] on the enum `payment_paymentMethod` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `payment` MODIFY `paymentMethod` ENUM('PIX', 'CREDIT_CARD') NULL;

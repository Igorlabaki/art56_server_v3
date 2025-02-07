/*
  Warnings:

  - A unique constraint covering the columns `[name,venueId]` on the table `Service` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `ProposalService_proposalId_serviceId_key` ON `proposalservice`;

-- CreateIndex
CREATE UNIQUE INDEX `Service_name_venueId_key` ON `Service`(`name`, `venueId`);

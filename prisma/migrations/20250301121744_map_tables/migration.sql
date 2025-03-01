/*
  Warnings:

  - You are about to drop the `dateevent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `dateevent`;

-- CreateTable
CREATE TABLE `dataEvent` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `proposalId` VARCHAR(191) NULL,
    `venueId` VARCHAR(191) NOT NULL,
    `type` ENUM('VISIT', 'EVENT', 'OTHER', 'BARTER', 'PROPOSAL', 'OVERNIGHT', 'PRODUCTION') NOT NULL,

    INDEX `dataEvent_proposalId_idx`(`proposalId`),
    INDEX `dataEvent_venueId_idx`(`venueId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- RenameIndex
ALTER TABLE `clause` RENAME INDEX `Clause_contractId_idx` TO `clause_contractId_idx`;

-- RenameIndex
ALTER TABLE `clause` RENAME INDEX `Clause_organizationId_idx` TO `clause_organizationId_idx`;

-- RenameIndex
ALTER TABLE `contact` RENAME INDEX `Contact_venueId_idx` TO `contact_venueId_idx`;

-- RenameIndex
ALTER TABLE `contract` RENAME INDEX `Contract_organizationId_idx` TO `contract_organizationId_idx`;

-- RenameIndex
ALTER TABLE `document` RENAME INDEX `Document_proposalId_idx` TO `document_proposalId_idx`;

-- RenameIndex
ALTER TABLE `history` RENAME INDEX `History_proposalId_idx` TO `history_proposalId_idx`;

-- RenameIndex
ALTER TABLE `history` RENAME INDEX `History_userId_idx` TO `history_userId_idx`;

-- RenameIndex
ALTER TABLE `image` RENAME INDEX `Image_venueId_idx` TO `image_venueId_idx`;

-- RenameIndex
ALTER TABLE `notification` RENAME INDEX `Notification_dateEventId_idx` TO `notification_dateEventId_idx`;

-- RenameIndex
ALTER TABLE `notification` RENAME INDEX `Notification_proposalId_idx` TO `notification_proposalId_idx`;

-- RenameIndex
ALTER TABLE `notification` RENAME INDEX `Notification_venueId_idx` TO `notification_venueId_idx`;

-- RenameIndex
ALTER TABLE `organization` RENAME INDEX `Organization_name_key` TO `organization_name_key`;

-- RenameIndex
ALTER TABLE `owner` RENAME INDEX `Owner_organizationId_idx` TO `owner_organizationId_idx`;

-- RenameIndex
ALTER TABLE `ownervenue` RENAME INDEX `OwnerVenue_ownerId_venueId_key` TO `ownerVenue_ownerId_venueId_key`;

-- RenameIndex
ALTER TABLE `ownervenue` RENAME INDEX `OwnerVenue_venueId_idx` TO `ownerVenue_venueId_idx`;

-- RenameIndex
ALTER TABLE `person` RENAME INDEX `Person_proposalId_idx` TO `person_proposalId_idx`;

-- RenameIndex
ALTER TABLE `proposalservice` RENAME INDEX `ProposalService_proposalId_idx` TO `proposalService_proposalId_idx`;

-- RenameIndex
ALTER TABLE `proposalservice` RENAME INDEX `ProposalService_serviceId_idx` TO `proposalService_serviceId_idx`;

-- RenameIndex
ALTER TABLE `question` RENAME INDEX `Question_venueId_idx` TO `question_venueId_idx`;

-- RenameIndex
ALTER TABLE `schedule` RENAME INDEX `Schedule_proposalId_idx` TO `schedule_proposalId_idx`;

-- RenameIndex
ALTER TABLE `service` RENAME INDEX `Service_name_venueId_key` TO `service_name_venueId_key`;

-- RenameIndex
ALTER TABLE `service` RENAME INDEX `Service_venueId_idx` TO `service_venueId_idx`;

-- RenameIndex
ALTER TABLE `text` RENAME INDEX `Text_venueId_idx` TO `text_venueId_idx`;

-- RenameIndex
ALTER TABLE `user` RENAME INDEX `User_email_key` TO `user_email_key`;

-- RenameIndex
ALTER TABLE `userorganization` RENAME INDEX `UserOrganization_organizationId_idx` TO `userOrganization_organizationId_idx`;

-- RenameIndex
ALTER TABLE `userorganization` RENAME INDEX `UserOrganization_userId_organizationId_key` TO `userOrganization_userId_organizationId_key`;

-- RenameIndex
ALTER TABLE `venue` RENAME INDEX `Venue_name_key` TO `venue_name_key`;

-- RenameIndex
ALTER TABLE `venue` RENAME INDEX `Venue_organizationId_idx` TO `venue_organizationId_idx`;

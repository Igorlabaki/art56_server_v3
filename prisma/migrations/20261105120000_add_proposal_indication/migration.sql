-- CreateTable
CREATE TABLE `proposal_indication` (
    `id` VARCHAR(191) NOT NULL,
    `proposalId` VARCHAR(191) NOT NULL,
    `contactId` VARCHAR(191) NOT NULL,
    `position` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `proposal_indication_proposalId_idx`(`proposalId`),
    INDEX `proposal_indication_contactId_idx`(`contactId`),
    UNIQUE INDEX `proposal_indication_proposalId_contactId_key`(`proposalId`, `contactId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

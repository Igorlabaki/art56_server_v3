-- CreateTable
CREATE TABLE `refresh_token` (
    `id` VARCHAR(191) NOT NULL,
    `expireIn` INTEGER NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `refresh_token_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `session` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `refreshTokenId` VARCHAR(191) NOT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `isValid` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,

    INDEX `session_userId_idx`(`userId`),
    INDEX `session_expiresAt_idx`(`expiresAt`),
    INDEX `session_refreshTokenId_idx`(`refreshTokenId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `avatarUrl` VARCHAR(191) NULL,

    UNIQUE INDEX `user_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `organization` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `organization_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `userOrganization` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `userOrganization_organizationId_idx`(`organizationId`),
    UNIQUE INDEX `userOrganization_userId_organizationId_key`(`userId`, `organizationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserPermission` (
    `id` VARCHAR(191) NOT NULL,
    `userOrganizationId` VARCHAR(191) NOT NULL,
    `permissions` LONGTEXT NOT NULL,
    `venueId` VARCHAR(191) NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'ADMIN',

    INDEX `UserPermission_userOrganizationId_idx`(`userOrganizationId`),
    INDEX `UserPermission_venueId_idx`(`venueId`),
    UNIQUE INDEX `UserPermission_userOrganizationId_venueId_key`(`userOrganizationId`, `venueId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `proposal` (
    `id` VARCHAR(191) NOT NULL,
    `completeCompanyName` VARCHAR(191) NULL,
    `completeClientName` VARCHAR(191) NOT NULL,
    `cpf` VARCHAR(191) NULL,
    `cnpj` VARCHAR(191) NULL,
    `rg` VARCHAR(191) NULL,
    `street` VARCHAR(191) NULL,
    `streetNumber` VARCHAR(191) NULL,
    `neighborhood` VARCHAR(191) NULL,
    `cep` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `type` ENUM('EVENT', 'OVERNIGHT', 'PRODUCTION', 'BARTER', 'OTHER') NOT NULL,
    `trafficSource` ENUM('AIRBNB', 'GOOGLE', 'INSTAGRAM', 'TIKTOK', 'OTHER', 'FRIEND', 'FACEBOOK') NOT NULL,
    `guestNumber` INTEGER NOT NULL,
    `knowsVenue` BOOLEAN NOT NULL DEFAULT false,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `whatsapp` VARCHAR(191) NOT NULL,
    `description` LONGTEXT NOT NULL,
    `hostMessage` LONGTEXT NULL,
    `basePrice` DOUBLE NOT NULL,
    `extraHoursQty` INTEGER NOT NULL,
    `extraHourPrice` DOUBLE NOT NULL,
    `totalAmount` DOUBLE NOT NULL,
    `termsAccepted` BOOLEAN NOT NULL DEFAULT false,
    `approved` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `contact` BOOLEAN NULL,
    `paid` BOOLEAN NULL DEFAULT false,
    `amountPaid` DOUBLE NULL DEFAULT 0.0,
    `venueId` VARCHAR(191) NOT NULL,

    INDEX `proposal_venueId_idx`(`venueId`),
    INDEX `proposal_trafficSource_idx`(`trafficSource`),
    INDEX `proposal_email_startDate_idx`(`email`, `startDate`),
    INDEX `proposal_completeClientName_startDate_idx`(`completeClientName`, `startDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `history` (
    `id` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NULL,
    `proposalId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `history_userId_idx`(`userId`),
    INDEX `history_proposalId_idx`(`proposalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `person` (
    `id` VARCHAR(191) NOT NULL,
    `attendance` BOOLEAN NOT NULL DEFAULT false,
    `type` ENUM('GUEST', 'WORKER') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `rg` VARCHAR(191) NULL,
    `confirmAttendanceEmail` BOOLEAN NOT NULL DEFAULT false,
    `proposalId` VARCHAR(191) NOT NULL,

    INDEX `person_proposalId_idx`(`proposalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `proposalService` (
    `id` VARCHAR(191) NOT NULL,
    `proposalId` VARCHAR(191) NOT NULL,
    `serviceId` VARCHAR(191) NOT NULL,
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `proposalService_proposalId_idx`(`proposalId`),
    INDEX `proposalService_serviceId_idx`(`serviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `venueId` VARCHAR(191) NOT NULL,

    INDEX `service_venueId_idx`(`venueId`),
    UNIQUE INDEX `service_name_venueId_key`(`name`, `venueId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment` (
    `id` VARCHAR(191) NOT NULL,
    `proposalId` VARCHAR(191) NOT NULL,
    `venueId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `paymentDate` DATETIME(3) NOT NULL,
    `paymentMethod` ENUM('PIX', 'CREDIT_CARD') NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `imageUrl` VARCHAR(191) NULL,

    INDEX `payment_proposalId_idx`(`proposalId`),
    INDEX `payment_venueId_idx`(`venueId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `proposalCost` (
    `id` VARCHAR(191) NOT NULL,
    `name` ENUM('RECEPTIONIST', 'SECURITY', 'CLEANER') NOT NULL,
    `teste` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `expense` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `amount` DOUBLE NOT NULL,
    `paymentDate` DATETIME(3) NULL,
    `type` ENUM('WEEKLY', 'ANNUAL', 'MONTHLY', 'BIWEEKLY', 'SPORADIC') NOT NULL,
    `category` ENUM('TAX', 'INVESTMENT', 'MAINTENANCE', 'ADVERTISING') NOT NULL,
    `recurring` BOOLEAN NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `venueId` VARCHAR(191) NOT NULL,

    INDEX `expense_venueId_idx`(`venueId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification` (
    `id` VARCHAR(191) NOT NULL,
    `venueId` VARCHAR(191) NOT NULL,
    `proposalId` VARCHAR(191) NULL,
    `dateEventId` VARCHAR(191) NULL,
    `content` VARCHAR(191) NOT NULL,
    `type` ENUM('VISIT', 'EVENT', 'OTHER', 'BARTER', 'PROPOSAL', 'OVERNIGHT', 'PRODUCTION') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isRead` BOOLEAN NOT NULL DEFAULT false,

    INDEX `notification_venueId_idx`(`venueId`),
    INDEX `notification_dateEventId_idx`(`dateEventId`),
    INDEX `notification_proposalId_idx`(`proposalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- CreateTable
CREATE TABLE `venue` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `street` VARCHAR(191) NOT NULL,
    `streetNumber` VARCHAR(191) NOT NULL,
    `complement` VARCHAR(191) NULL,
    `neighborhood` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `checkIn` VARCHAR(191) NULL DEFAULT '12:00',
    `checkOut` VARCHAR(191) NULL DEFAULT '12:00',
    `cep` VARCHAR(191) NOT NULL,
    `hasOvernightStay` BOOLEAN NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `organizationId` VARCHAR(191) NOT NULL,
    `pricingModel` ENUM('PER_PERSON', 'PER_DAY', 'PER_PERSON_DAY', 'PER_PERSON_HOUR') NOT NULL,
    `pricePerPerson` DOUBLE NULL,
    `pricePerDay` DOUBLE NULL,
    `pricePerPersonDay` DOUBLE NULL,
    `pricePerPersonHour` DOUBLE NULL,
    `maxGuest` INTEGER NOT NULL,

    UNIQUE INDEX `venue_name_key`(`name`),
    UNIQUE INDEX `venue_email_key`(`email`),
    INDEX `venue_organizationId_idx`(`organizationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SeasonalFee` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('SURCHARGE', 'DISCOUNT') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `startDay` VARCHAR(191) NULL,
    `endDay` VARCHAR(191) NULL,
    `fee` INTEGER NOT NULL,
    `venueId` VARCHAR(191) NOT NULL,
    `affectedDays` VARCHAR(191) NULL,

    INDEX `SeasonalFee_venueId_idx`(`venueId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contact` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL,
    `whatsapp` VARCHAR(191) NOT NULL,
    `venueId` VARCHAR(191) NOT NULL,

    INDEX `contact_venueId_idx`(`venueId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ownerVenue` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `venueId` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'ADMIN',
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ownerVenue_venueId_idx`(`venueId`),
    UNIQUE INDEX `ownerVenue_ownerId_venueId_key`(`ownerId`, `venueId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `owner` (
    `id` VARCHAR(191) NOT NULL,
    `completeName` VARCHAR(191) NOT NULL,
    `rg` VARCHAR(191) NULL,
    `cpf` VARCHAR(191) NOT NULL,
    `pix` VARCHAR(191) NOT NULL,
    `street` VARCHAR(191) NOT NULL,
    `streetNumber` VARCHAR(191) NOT NULL,
    `complement` VARCHAR(191) NULL,
    `neighborhood` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `bankName` VARCHAR(191) NOT NULL,
    `bankAgency` VARCHAR(191) NOT NULL,
    `cep` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `bankAccountNumber` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,

    INDEX `owner_organizationId_idx`(`organizationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `image` (
    `id` VARCHAR(191) NOT NULL,
    `imageUrl` LONGTEXT NOT NULL,
    `description` VARCHAR(191) NULL,
    `position` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `responsiveMode` VARCHAR(191) NULL,
    `tag` VARCHAR(191) NULL,
    `venueId` VARCHAR(191) NOT NULL,

    INDEX `image_venueId_idx`(`venueId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `text` (
    `id` VARCHAR(191) NOT NULL,
    `area` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `position` INTEGER NOT NULL DEFAULT 0,
    `text` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `venueId` VARCHAR(191) NOT NULL,

    INDEX `text_venueId_idx`(`venueId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `document` (
    `id` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `thumbnailUrl` VARCHAR(191) NULL,
    `fileType` ENUM('PDF', 'IMAGE') NOT NULL,
    `proposalId` VARCHAR(191) NOT NULL,
    `paymentId` VARCHAR(191) NULL,

    INDEX `document_paymentId_idx`(`paymentId`),
    INDEX `document_proposalId_idx`(`proposalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `question` (
    `id` VARCHAR(191) NOT NULL,
    `question` LONGTEXT NOT NULL,
    `response` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `venueId` VARCHAR(191) NOT NULL,

    INDEX `question_venueId_idx`(`venueId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contract` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,

    INDEX `contract_organizationId_idx`(`organizationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clause` (
    `id` VARCHAR(191) NOT NULL,
    `text` LONGTEXT NOT NULL,
    `title` LONGTEXT NOT NULL,
    `position` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `organizationId` VARCHAR(191) NULL,

    INDEX `clause_organizationId_idx`(`organizationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attachments` (
    `id` VARCHAR(191) NOT NULL,
    `text` LONGTEXT NOT NULL,
    `title` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `organizationId` VARCHAR(191) NULL,
    `venueId` VARCHAR(191) NULL,

    INDEX `attachments_organizationId_idx`(`organizationId`),
    INDEX `attachments_venueId_idx`(`venueId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `schedule` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `workerNumber` INTEGER NOT NULL,
    `description` LONGTEXT NULL,
    `startHour` DATETIME(3) NOT NULL,
    `endHour` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `proposalId` VARCHAR(191) NOT NULL,

    INDEX `schedule_proposalId_idx`(`proposalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ProposalToProposalCost` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ProposalToProposalCost_AB_unique`(`A`, `B`),
    INDEX `_ProposalToProposalCost_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ContractVenues` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ContractVenues_AB_unique`(`A`, `B`),
    INDEX `_ContractVenues_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ContractClauses` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ContractClauses_AB_unique`(`A`, `B`),
    INDEX `_ContractClauses_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

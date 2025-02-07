import prismaClient from "../../../service/prisma-client";
import { CreateProposalPerPersonUseCase } from "./use-case-create-proposal-per-person";
import { CreateProposalPerPersonController } from "./controller-create-proposal-per-person";
import { PrismaUserRepository } from "../../../repositories/in-prisma/user-in-prisma-repository";
import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";
import { PrismaServiceRepository } from "../../../repositories/in-prisma/service-in-prisma-repository";
import { PrismaHistoryRepository } from "../../../repositories/in-prisma/history-in-prisma-repository";
import { PrismaProposalRepository } from "../../../repositories/in-prisma/proposal-in-prisma-repository";
import { PrismaNotificationRepository } from "../../../repositories/in-prisma/notification-in-prisma-repository";

export const createProposalPerPersonFactory = (): CreateProposalPerPersonController => {
    const prismaUserRepository = new PrismaUserRepository(prismaClient);
    const prismaVenueRepository = new PrismaVenueRepository(prismaClient);
    const prismaHistoryRepository = new PrismaHistoryRepository(prismaClient);
    const prismaServiceRepository = new PrismaServiceRepository(prismaClient);
    const prismaProposalRepository = new PrismaProposalRepository(prismaClient);
    const prismaNotificationRepository = new PrismaNotificationRepository(prismaClient);
    const createProposalPerPersonUseCase = new CreateProposalPerPersonUseCase(
        prismaUserRepository,
        prismaVenueRepository,
        prismaServiceRepository,
        prismaHistoryRepository,
        prismaProposalRepository,
        prismaNotificationRepository
    );
    const createProposalPerPersonController = new CreateProposalPerPersonController(createProposalPerPersonUseCase);

    return createProposalPerPersonController;
};

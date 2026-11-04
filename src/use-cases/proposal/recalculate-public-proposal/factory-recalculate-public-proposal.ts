import prismaClient from "../../../services/prisma-client";
import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";
import { PrismaServiceRepository } from "../../../repositories/in-prisma/service-in-prisma-repository";
import { PrismaHistoryRepository } from "../../../repositories/in-prisma/history-in-prisma-repository";
import { PrismaProposalRepository } from "../../../repositories/in-prisma/proposal-in-prisma-repository";
import { PrismaGoalRepository } from "../../../repositories/in-prisma/goal-in-prisma-repository";
import { RecalculatePublicProposalUseCase } from "./use-case-recalculate-public-proposal";
import { RecalculatePublicProposalController } from "./controller-recalculate-public-proposal";

export const recalculatePublicProposalFactory = () => {
    const useCase = new RecalculatePublicProposalUseCase(
        new PrismaVenueRepository(prismaClient),
        new PrismaServiceRepository(prismaClient),
        new PrismaHistoryRepository(prismaClient),
        new PrismaProposalRepository(prismaClient),
        new PrismaGoalRepository(prismaClient),
    );
    return new RecalculatePublicProposalController(useCase);
};

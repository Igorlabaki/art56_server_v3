import prismaClient from "../../../services/prisma-client";
import { PrismaHistoryRepository } from "../../../repositories/in-prisma/history-in-prisma-repository";
import { PrismaProposalRepository } from "../../../repositories/in-prisma/proposal-in-prisma-repository";
import { PrismaServiceRepository } from "../../../repositories/in-prisma/service-in-prisma-repository";
import { UpdatePublicProposalServicesController } from "./controller-update-public-proposal-services";
import { UpdatePublicProposalServicesUseCase } from "./use-case-update-public-proposal-services";

export const updatePublicProposalServicesFactory = () => {
    const useCase = new UpdatePublicProposalServicesUseCase(
        new PrismaServiceRepository(prismaClient),
        new PrismaHistoryRepository(prismaClient),
        new PrismaProposalRepository(prismaClient),
    );
    return new UpdatePublicProposalServicesController(useCase);
};

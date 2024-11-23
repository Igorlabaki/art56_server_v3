import prismaClient from "../../../service/prisma-client";
import { CreateProposalUseCase } from "./use-case-create-proposal";
import { CreateProposalController } from "./controller-create-proposal";
import { PrismaProposalRepository } from "../../../repositories/in-prisma/proposal-in-prisma-repository";
import { PrismaServiceRepository } from "../../../repositories/in-prisma/service-in-prisma-repository";
import { PrismaNotificationRepository } from "../../../repositories/in-prisma/notification-in-prisma-repository";

export const createProposalFactory = (): CreateProposalController => {
    const prismaServiceRepository = new PrismaServiceRepository(prismaClient);
    const prismaProposalRepository = new PrismaProposalRepository(prismaClient);
    const prismaNotificationRepository = new PrismaNotificationRepository(prismaClient);
    const createProposalUseCase = new CreateProposalUseCase(prismaProposalRepository,prismaServiceRepository,prismaNotificationRepository);
    const createProposalController = new CreateProposalController(createProposalUseCase);

    return createProposalController;
};

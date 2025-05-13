import prismaClient from "../../../services/prisma-client";
import { CreateDateController } from "./controller-create-date-event";
import { CreateDateEventUseCase } from "./use-case-create-date-event";
import { PrismaHistoryRepository } from "../../../repositories/in-prisma/history-in-prisma-repository";
import { PrismaProposalRepository } from "../../../repositories/in-prisma/proposal-in-prisma-repository";
import { PrismaDateEventRepository } from "../../../repositories/in-prisma/date-event-in-prisma-repository";
import { PrismaNotificationRepository } from "../../../repositories/in-prisma/notification-in-prisma-repository";

export const createDateFactory = (): CreateDateController => {
    const prismaNotificationRepository = new PrismaNotificationRepository(prismaClient);
    const prismaDateRepository = new PrismaDateEventRepository(prismaClient);
    const prismaHistoryRepository = new PrismaHistoryRepository(prismaClient);
    const prismaProposalRepository = new PrismaProposalRepository(prismaClient);
    const createDateUseCase = new CreateDateEventUseCase(prismaHistoryRepository,prismaProposalRepository,prismaDateRepository,prismaNotificationRepository);
    const createDateController = new CreateDateController(createDateUseCase);

    return createDateController;
};

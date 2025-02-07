import prismaClient from "../../../service/prisma-client";
import { CreateOvernightDateController } from "./controller-create-date-event";
import { CreateOvernightDateEventUseCase } from "./use-case-create-overnigth-date-event";
import { PrismaHistoryRepository } from "../../../repositories/in-prisma/history-in-prisma-repository";
import { PrismaProposalRepository } from "../../../repositories/in-prisma/proposal-in-prisma-repository";
import { PrismaDateEventRepository } from "../../../repositories/in-prisma/date-event-in-prisma-repository";
import { PrismaNotificationRepository } from "../../../repositories/in-prisma/notification-in-prisma-repository";

export const createOvernightDateFactory = (): CreateOvernightDateController => {
    const prismaNotificationRepository = new PrismaNotificationRepository(prismaClient);
    const prismaDateRepository = new PrismaDateEventRepository(prismaClient);
    const prismaHistoryRepository = new PrismaHistoryRepository(prismaClient);
    const prismaProposalRepository = new PrismaProposalRepository(prismaClient);
    const createDateUseCase = new CreateOvernightDateEventUseCase(prismaHistoryRepository,prismaProposalRepository,prismaDateRepository,prismaNotificationRepository);
    const createDateController = new CreateOvernightDateController(createDateUseCase);

    return createDateController;
};

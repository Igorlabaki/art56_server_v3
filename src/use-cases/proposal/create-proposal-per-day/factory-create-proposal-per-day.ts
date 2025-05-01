import prismaClient from "../../../service/prisma-client";
import { CreateProposalPerDayUseCase } from "./use-case-create-proposal-per-day";
import { CreateProposalPerDayController } from "./controller-create-proposal-per-day";
import { PrismaUserRepository } from "../../../repositories/in-prisma/user-in-prisma-repository";
import { PrismaGoalRepository } from "../../../repositories/in-prisma/goal-in-prisma-repository";
import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";
import { PrismaServiceRepository } from "../../../repositories/in-prisma/service-in-prisma-repository";
import { PrismaHistoryRepository } from "../../../repositories/in-prisma/history-in-prisma-repository";
import { PrismaProposalRepository } from "../../../repositories/in-prisma/proposal-in-prisma-repository";
import { PrismaNotificationRepository } from "../../../repositories/in-prisma/notification-in-prisma-repository";
import { NotificationService } from "../../../service/notification-service";
import { io } from "../../../server";

export const createProposalPerDayFactory = () => {
    const prismaUserRepository = new PrismaUserRepository(prismaClient);
    const prismaGoalRepository = new PrismaGoalRepository(prismaClient);
    const prismaVenueRepository = new PrismaVenueRepository(prismaClient);
    const prismaServiceRepository = new PrismaServiceRepository(prismaClient);
    const prismaHistoryRepository = new PrismaHistoryRepository(prismaClient);
    const prismaProposalRepository = new PrismaProposalRepository(prismaClient);
    const prismaNotificationRepository = new PrismaNotificationRepository(prismaClient);
    const notificationService = new NotificationService(io);

    const createProposalPerDayUseCase = new CreateProposalPerDayUseCase(
        prismaUserRepository,
        prismaGoalRepository,
        prismaVenueRepository,
        prismaServiceRepository,
        prismaHistoryRepository,
        prismaProposalRepository,
        prismaNotificationRepository,
        notificationService
    );

    const createProposalPerDayController = new CreateProposalPerDayController(createProposalPerDayUseCase);

    return createProposalPerDayController;
}; 
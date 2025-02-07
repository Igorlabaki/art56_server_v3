import prismaClient from "../../../service/prisma-client";
import { ListNotificationsUseCase } from "./use-case-list-notification";
import { ListNotificationController } from "./controller-list-notification";
import { PrismaNotificationRepository } from "../../../repositories/in-prisma/notification-in-prisma-repository";

export const listNotificationFactory = (): ListNotificationController => {
    const prismaNotificationRepository = new PrismaNotificationRepository(prismaClient);
    const listNotificationUseCase = new ListNotificationsUseCase(prismaNotificationRepository);
    const listNotificationController = new ListNotificationController(listNotificationUseCase);

    return listNotificationController;
};

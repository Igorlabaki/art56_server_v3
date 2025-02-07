import prismaClient from "../../../service/prisma-client";
import { CreateNotificationUseCase } from "./use-case-create-notification";
import { CreateNotificationController } from "./controller-create-notification";
import { PrismaNotificationRepository } from "../../../repositories/in-prisma/notification-in-prisma-repository";

export const createNotificationFactory = () => {
  const prismaNotificationRepository = new PrismaNotificationRepository(prismaClient);
  const createNotificationsCase = new CreateNotificationUseCase(prismaNotificationRepository); 
  const createNotificationController = new CreateNotificationController(createNotificationsCase);

  return createNotificationController;
};

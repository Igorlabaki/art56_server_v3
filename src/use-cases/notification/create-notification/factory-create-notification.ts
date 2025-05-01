import prismaClient from "../../../service/prisma-client";
import { CreateNotificationUseCase } from "./use-case-create-notification";
import { CreateNotificationController } from "./controller-create-notification";
import { PrismaNotificationRepository } from "../../../repositories/in-prisma/notification-in-prisma-repository";
import { NotificationService } from "../../../service/notification-service";
import { io } from "../../../server";

export const createNotificationFactory = () => {
  const prismaNotificationRepository = new PrismaNotificationRepository(prismaClient);
  const notificationService = new NotificationService(io);
  const createNotificationsCase = new CreateNotificationUseCase(
    prismaNotificationRepository,
    notificationService
  ); 
  const createNotificationController = new CreateNotificationController(createNotificationsCase);

  return createNotificationController;
};

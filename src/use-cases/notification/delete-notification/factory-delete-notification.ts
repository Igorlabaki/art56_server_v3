import prismaClient from "../../../services/prisma-client";
import { DeleteNotificationUseCase } from "./use-case-delete-notification";
import { DeleteNotificationController } from "./controller-delete-notification";
import { PrismaNotificationRepository } from "../../../repositories/in-prisma/notification-in-prisma-repository";

export const deleteNotificationFactory = () => {
  const prismaNotificationRepository = new PrismaNotificationRepository(prismaClient);
  const deleteNotificationCase = new DeleteNotificationUseCase(prismaNotificationRepository);
  const deleteNotificationController = new DeleteNotificationController(deleteNotificationCase);

  return deleteNotificationController;
};

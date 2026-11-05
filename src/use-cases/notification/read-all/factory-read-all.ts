import prismaClient from "../../../services/prisma-client";
import { PrismaNotificationRepository } from "../../../repositories/in-prisma/notification-in-prisma-repository";
import { PrismaUserVenuePermissionRepository } from "../../../repositories/in-prisma/user-venue-permission-in-prisma-repository";
import { PrismaVenueRepository } from "../../../repositories/in-prisma/venue-in-prisma-repository";
import { ReadAllNotificationsController } from "./controller-read-all";
import { ReadAllNotificationsUseCase } from "./use-case-read-all";

export const readAllNotificationsFactory = (): ReadAllNotificationsController => {
  const useCase = new ReadAllNotificationsUseCase(
    new PrismaNotificationRepository(prismaClient),
    new PrismaVenueRepository(prismaClient),
    new PrismaUserVenuePermissionRepository(prismaClient),
  );
  return new ReadAllNotificationsController(useCase);
};

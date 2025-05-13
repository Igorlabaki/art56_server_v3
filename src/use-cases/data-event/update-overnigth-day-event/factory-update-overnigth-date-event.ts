import prismaClient from "../../../services/prisma-client";

import { UpdateOvernigthDateEventUseCase } from "./use-case-update-overnigth-date-event";
import { UpdateOverNigthDateEventController } from "./controller-update-overnigth-date-event";
import { PrismaHistoryRepository } from "../../../repositories/in-prisma/history-in-prisma-repository";
import { PrismaDateEventRepository } from "../../../repositories/in-prisma/date-event-in-prisma-repository";
import { PrismaNotificationRepository } from "../../../repositories/in-prisma/notification-in-prisma-repository";

export const updateOverNigthDateEventFactory = () => {
  const prismaNotificationRepository = new PrismaNotificationRepository(prismaClient);
  const prismaDateRepository = new PrismaDateEventRepository(prismaClient);
  const prismaHistoryRepository = new PrismaHistoryRepository(prismaClient);
  const updateOverNigthDateEventUseCase = new UpdateOvernigthDateEventUseCase(prismaHistoryRepository,prismaDateRepository,prismaNotificationRepository);
  const updateVenueController = new UpdateOverNigthDateEventController(updateOverNigthDateEventUseCase);

  return updateVenueController;
};

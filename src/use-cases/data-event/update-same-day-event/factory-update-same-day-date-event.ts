import prismaClient from "../../../service/prisma-client";
import { UpdateSameDayDateEventUseCase } from "./use-case-update-same-day-date-event";
import { UpdateSameDayDateEventController } from "./controller-update-same-day-date-event";
import { PrismaHistoryRepository } from "../../../repositories/in-prisma/history-in-prisma-repository";
import { PrismaDateEventRepository } from "../../../repositories/in-prisma/date-event-in-prisma-repository";
import { PrismaNotificationRepository } from "../../../repositories/in-prisma/notification-in-prisma-repository";

export const updateSameDayDateEventFactory = () => {
  const prismaNotificationRepository = new PrismaNotificationRepository(prismaClient);
  const prismaDateRepository = new PrismaDateEventRepository(prismaClient);
  const prismaHistoryRepository = new PrismaHistoryRepository(prismaClient);
  const updateSameDayDateEventUseCase = new UpdateSameDayDateEventUseCase(prismaHistoryRepository,prismaDateRepository,prismaNotificationRepository);
  const updateVenueController = new UpdateSameDayDateEventController(updateSameDayDateEventUseCase);

  return updateVenueController;
};

import prismaClient from "../../../service/prisma-client";
import { DeleteScheduleUseCase } from "./use-case-delete-schedule";
import { DeleteScheduleController } from "./controller-delete-schedule";
import { PrismaScheduleRepository } from "../../../repositories/in-prisma/schedule-in-prisma-repository";

export const deleteScheduleFactory = () => {
  const prismaScheduleRepository = new PrismaScheduleRepository(prismaClient);
  const deleteScheduleCase = new DeleteScheduleUseCase(prismaScheduleRepository);
  const deleteScheduleController = new DeleteScheduleController(deleteScheduleCase);

  return deleteScheduleController;
};

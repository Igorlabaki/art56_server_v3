import prismaClient from "../../../services/prisma-client";
import { GetByIdScheduleUseCase } from "./use-case-get-by-id-schedule";
import { GetByIdScheduleController } from "./controller-get-by-id-schedule";
import { PrismaScheduleRepository } from "../../../repositories/in-prisma/schedule-in-prisma-repository";

export const getByIdScheduleFactory = () => {
  const prismaScheduleRepository = new PrismaScheduleRepository(prismaClient);
  const getbyidScheduleCase = new GetByIdScheduleUseCase(prismaScheduleRepository);
  const getbyidScheduleController = new GetByIdScheduleController(getbyidScheduleCase);

  return getbyidScheduleController;
};

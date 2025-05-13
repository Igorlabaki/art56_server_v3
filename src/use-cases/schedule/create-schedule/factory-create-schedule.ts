import prismaClient from "../../../services/prisma-client";
import { CreateScheduleUseCase } from "./use-case-create-schedule";
import { CreateScheduleController } from "./controller-create-schedule";
import { PrismaScheduleRepository } from "../../../repositories/in-prisma/schedule-in-prisma-repository";
import { PrismaProposalRepository } from "../../../repositories/in-prisma/proposal-in-prisma-repository";

export const createScheduleFactory = () => {
  const prismaScheduleRepository = new PrismaScheduleRepository(prismaClient);
  const prismaProposalRepository = new PrismaProposalRepository(prismaClient);
  const createSchedulesCase = new CreateScheduleUseCase(prismaScheduleRepository,prismaProposalRepository); 
  const createScheduleController = new CreateScheduleController(createSchedulesCase);

  return createScheduleController;
};

import prismaClient from "../../../service/prisma-client";
import { UpdateScheduleUseCase } from "./use-case-update-schedule";
import { UpdateScheduleController } from "./controller-update-schedule";
import { PrismaScheduleRepository } from "../../../repositories/in-prisma/schedule-in-prisma-repository";
import { PrismaProposalRepository } from "../../../repositories/in-prisma/proposal-in-prisma-repository";

export const updateScheduleFactory = () => {
  const prismaScheduleRepository = new PrismaScheduleRepository(prismaClient);
  const prismaProposalRepository = new PrismaProposalRepository(prismaClient);
  const updateScheduleCase = new UpdateScheduleUseCase(prismaScheduleRepository,prismaProposalRepository);
  const updateScheduleController = new UpdateScheduleController(updateScheduleCase);

  return updateScheduleController;
};

import prismaClient from "../../../service/prisma-client";
import { ListSchedulesUseCase } from "./use-case-list-schedule";
import { ListScheduleController } from "./controller-list-schedule";
import { PrismaScheduleRepository } from "../../../repositories/in-prisma/schedule-in-prisma-repository";

export const listScheduleFactory = (): ListScheduleController => {
    const prismaScheduleRepository = new PrismaScheduleRepository(prismaClient);
    const listScheduleUseCase = new ListSchedulesUseCase(prismaScheduleRepository);
    const listScheduleController = new ListScheduleController(listScheduleUseCase);

    return listScheduleController;
};

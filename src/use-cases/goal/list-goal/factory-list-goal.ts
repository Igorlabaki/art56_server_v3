import prismaClient from "../../../service/prisma-client";
import { ListGoalsUseCase } from "./use-case-list-goal";
import { ListGoalController } from "./controller-list-goal";
import { PrismaGoalRepository } from "../../../repositories/in-prisma/goal-in-prisma-repository";

export const listGoalFactory = (): ListGoalController => {
    const prismaGoalRepository = new PrismaGoalRepository(prismaClient);
    const listGoalUseCase = new ListGoalsUseCase(prismaGoalRepository);
    const listGoalController = new ListGoalController(listGoalUseCase);

    return listGoalController;
};

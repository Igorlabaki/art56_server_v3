import prismaClient from "../../../services/prisma-client";
import { UpdateGoalUseCase } from "./use-case-update-goal";
import { UpdateGoalController } from "./controller-update-goal";
import { PrismaGoalRepository } from "../../../repositories/in-prisma/goal-in-prisma-repository";

export const updateGoalFactory = () => {
  const prismaGoalRepository = new PrismaGoalRepository(prismaClient);
  const updateGoalCase = new UpdateGoalUseCase(prismaGoalRepository);
  const updateGoalController = new UpdateGoalController(updateGoalCase);

  return updateGoalController;
};

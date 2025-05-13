import prismaClient from "../../../services/prisma-client";
import { DeleteGoalUseCase } from "./use-case-delete-goal";
import { DeleteGoalController } from "./controller-delete-goal";
import { PrismaGoalRepository } from "../../../repositories/in-prisma/goal-in-prisma-repository";

export const deleteGoalFactory = () => {
  const prismaGoalRepository = new PrismaGoalRepository(prismaClient);
  const deleteGoalCase = new DeleteGoalUseCase(prismaGoalRepository);
  const deleteGoalController = new DeleteGoalController(deleteGoalCase);

  return deleteGoalController;
};

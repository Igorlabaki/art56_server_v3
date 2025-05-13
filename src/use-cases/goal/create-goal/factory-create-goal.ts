import prismaClient from "../../../services/prisma-client";
import { CreateGoalUseCase } from "./use-case-create-goal";
import { CreateGoalController } from "./controller-create-goal";
import { PrismaGoalRepository } from "../../../repositories/in-prisma/goal-in-prisma-repository";

export const createGoalFactory = () => {
  const prismaGoalRepository = new PrismaGoalRepository(prismaClient);
  const createGoalsCase = new CreateGoalUseCase(prismaGoalRepository); 
  const createGoalController = new CreateGoalController(createGoalsCase);

  return createGoalController;
};

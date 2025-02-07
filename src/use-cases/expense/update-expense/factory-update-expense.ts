
import prismaClient from "../../../service/prisma-client";
import { UpdateExpenseUseCase } from "./use-case-update-expense";
import { UpdateExpenseController } from "./controller-update-expense";
import { PrismaExpenseRepository } from "../../../repositories/in-prisma/expense-in-prisma-repository";

export const updateExpenseFactory = () => {
  const prismaExpenseRepository = new PrismaExpenseRepository(prismaClient);
  const updateExpenseCase = new UpdateExpenseUseCase(prismaExpenseRepository);
  const updateExpenseController = new UpdateExpenseController(updateExpenseCase);

  return updateExpenseController;
};

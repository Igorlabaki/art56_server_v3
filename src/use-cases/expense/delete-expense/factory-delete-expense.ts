
import prismaClient from "../../../service/prisma-client";
import { DeleteExpenseUseCase } from "./use-case-delete-expense";
import { DeleteExpenseController } from "./controller-delete-expense";
import { PrismaExpenseRepository } from "../../../repositories/in-prisma/expense-in-prisma-repository";

export const deleteExpenseFactory = () => {
  const prismaExpenseRepository = new PrismaExpenseRepository(prismaClient);
  const deleteExpenseCase = new DeleteExpenseUseCase(prismaExpenseRepository);
  const deleteExpenseController = new DeleteExpenseController(deleteExpenseCase);

  return deleteExpenseController;
};

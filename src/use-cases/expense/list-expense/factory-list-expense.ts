
import prismaClient from "../../../service/prisma-client";
import { ListExpensesUseCase } from "./use-case-list-expense";
import { ListExpenseController } from "./controller-list-expense";
import { PrismaExpenseRepository } from "../../../repositories/in-prisma/expense-in-prisma-repository";

export const listExpenseFactory = (): ListExpenseController => {
    const prismaExpenseRepository = new PrismaExpenseRepository(prismaClient);
    const listExpenseUseCase = new ListExpensesUseCase(prismaExpenseRepository);
    const listExpenseController = new ListExpenseController(listExpenseUseCase);

    return listExpenseController;
};

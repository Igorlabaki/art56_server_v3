import prismaClient from "../../../services/prisma-client";
import { CreateExpenseUseCase } from "./use-case-create-expense";
import { CreateExpenseController } from "./controller-create-expense";
import { PrismaExpenseRepository } from "../../../repositories/in-prisma/expense-in-prisma-repository";

export const createExpenseFactory = (): CreateExpenseController => {
    const prismaExpenseRepository = new PrismaExpenseRepository(prismaClient);
    const createExpenseUseCase = new CreateExpenseUseCase(prismaExpenseRepository);
    const createExpenseController = new CreateExpenseController(createExpenseUseCase);

    return createExpenseController;
};

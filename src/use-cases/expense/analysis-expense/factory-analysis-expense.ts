
import prismaClient from "../../../service/prisma-client";
import { AnalysisExpenseUseCase } from "./use-case-analysis-expense";
import { AnalysisExpenseController } from "./controller-analysis-expense";
import { PrismaExpenseRepository } from "../../../repositories/in-prisma/expense-in-prisma-repository";

export const analysisExpenseFactory = () => {
  const prismaExpenseRepository = new PrismaExpenseRepository(prismaClient);
  const analysisExpenseCase = new AnalysisExpenseUseCase(prismaExpenseRepository);
  const analysisExpenseController = new AnalysisExpenseController(analysisExpenseCase);

  return analysisExpenseController;
};

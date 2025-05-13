import prismaClient from "../../../services/prisma-client";
import { CreateQuestionUseCase } from "./use-case-create-question";
import { CreateQuestionController } from "./controller-create-question";
import { PrismaQuestionRepository } from "../../../repositories/in-prisma/question-in-prisma-repository";

export const createQuestionFactory = () => {
  const prismaQuestionRepository = new PrismaQuestionRepository(prismaClient);
  const createQuestionsCase = new CreateQuestionUseCase(prismaQuestionRepository); 
  const createQuestionController = new CreateQuestionController(createQuestionsCase);

  return createQuestionController;
};

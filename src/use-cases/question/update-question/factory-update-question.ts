import prismaClient from "../../../services/prisma-client";
import { UpdateQuestionUseCase } from "./use-case-update-question";
import { UpdateQuestionController } from "./controller-update-question";
import { PrismaQuestionRepository } from "../../../repositories/in-prisma/question-in-prisma-repository";

export const updateQuestionFactory = () => {
  const prismaQuestionRepository = new PrismaQuestionRepository(prismaClient);
  const updateQuestionCase = new UpdateQuestionUseCase(prismaQuestionRepository);
  const updateQuestionController = new UpdateQuestionController(updateQuestionCase);

  return updateQuestionController;
};

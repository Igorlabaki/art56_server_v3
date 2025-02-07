import prismaClient from "../../../service/prisma-client";
import { DeleteQuestionUseCase } from "./use-case-delete-question";
import { DeleteQuestionController } from "./controller-delete-question";
import { PrismaQuestionRepository } from "../../../repositories/in-prisma/question-in-prisma-repository";

export const deleteQuestionFactory = () => {
  const prismaQuestionRepository = new PrismaQuestionRepository(prismaClient);
  const deleteQuestionCase = new DeleteQuestionUseCase(prismaQuestionRepository);
  const deleteQuestionController = new DeleteQuestionController(deleteQuestionCase);

  return deleteQuestionController;
};

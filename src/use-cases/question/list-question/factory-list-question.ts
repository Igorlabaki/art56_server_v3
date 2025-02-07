import prismaClient from "../../../service/prisma-client";
import { ListQuestionsUseCase } from "./use-case-list-question";
import { ListQuestionController } from "./controller-list-question";
import { PrismaQuestionRepository } from "../../../repositories/in-prisma/question-in-prisma-repository";

export const listQuestionFactory = (): ListQuestionController => {
    const prismaQuestionRepository = new PrismaQuestionRepository(prismaClient);
    const listQuestionUseCase = new ListQuestionsUseCase(prismaQuestionRepository);
    const listQuestionController = new ListQuestionController(listQuestionUseCase);

    return listQuestionController;
};

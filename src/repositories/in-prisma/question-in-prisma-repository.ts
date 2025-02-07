import { PrismaClient, Question } from "@prisma/client";
import { QuestionRepositoryInterface } from "../interface/question-repository-interface";
import { CreateQuestionRequestParams } from "../../zod/question/create-question-params-schema";
import { ListQuestionRequestQuerySchema } from "../../zod/question/list-question-query-schema";
import { UpdateQuestionRequestParams } from "../../zod/question/update-question-params-schema";

export class PrismaQuestionRepository implements QuestionRepositoryInterface {
  constructor(private readonly prisma: PrismaClient) { }

  async create(params: CreateQuestionRequestParams): Promise<Question | null> {
    return await this.prisma.question.create({
      data: {
        ...params,
      },
    });
  }

  async delete(reference: string): Promise<Question | null> {
    return await this.prisma.question.delete({
      where: {
        id: reference,
      },
    });
  }

  async getById(reference: string): Promise<Question | null> {
    return await this.prisma.question.findFirst({
      where: {
        id: reference,
      },
    });
  }

  async getByQuestion(reference: string): Promise<Question | null> {
    return await this.prisma.question.findFirst({
      where: {
        question: reference,
      },
    });
  }

  async update({ data, questionId }: UpdateQuestionRequestParams): Promise<Question | null> {
    return await this.prisma.question.update({
      where: {
        id: questionId,
      },
      data: {
        ...data,
      },
    });
  }

  async list({ venueId, question }: ListQuestionRequestQuerySchema): Promise<Question[]> {
    return await this.prisma.question.findMany({
      where: {
        ...(question && {
          question: {
            contains: question
          }
        }),
        venueId
      },
    });
  }
}

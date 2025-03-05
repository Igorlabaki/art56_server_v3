import { Question } from "@prisma/client";
import { CreateQuestionRequestParams } from "../../zod/question/create-question-params-schema";
import { ListQuestionRequestQuerySchema } from "../../zod/question/list-question-query-schema";
import { UpdateQuestionRequestParams } from "../../zod/question/update-question-params-schema";

export interface QuestionRepositoryInterface {
  delete: (params: string) => Promise<Question | null>;  
  getById: (params: string) => Promise<Question | null>;
  update: (params: UpdateQuestionRequestParams) => Promise<Question | null>;
  create: (params: CreateQuestionRequestParams) => Promise<Question | null>;
  list: (params: ListQuestionRequestQuerySchema) => Promise<Question[]  | null>;
  getByQuestion: (params: {question: string, venueId: string, questionId: string | undefined}) => Promise<Question | null>
}
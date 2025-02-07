import { ListQuestionRequestQuerySchema } from "../../../zod/question/list-question-query-schema";
import { QuestionRepositoryInterface } from "../../../repositories/interface/question-repository-interface";

class ListQuestionsUseCase {
  constructor(private questionRepository: QuestionRepositoryInterface) { }

  async execute(query: ListQuestionRequestQuerySchema) {
    const questionList = await this.questionRepository.list(query);

    const formatedResponse = {
      success: true,
      message: `Lista de perguntas com ${questionList?.length} items`,
      data: {
        questionList: questionList
      },
      count: questionList?.length,
      type: "List"
    }

    return formatedResponse;
  }
}

export { ListQuestionsUseCase };

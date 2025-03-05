import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { QuestionRepositoryInterface } from "../../../repositories/interface/question-repository-interface";
import { CreateQuestionRequestParams } from "../../../zod/question/create-question-params-schema";

class CreateQuestionUseCase {
  constructor(private questionRepository: QuestionRepositoryInterface) {}

  async execute(params: CreateQuestionRequestParams) {
    const questionAlreadyExists = await this.questionRepository.getByQuestion({
      venueId: params.venueId,
      question: params.question,
      questionId: undefined
    });

    if(questionAlreadyExists){
      throw new HttpConflictError("Essa pergunta ja esta cadastrada.")
    }

    const newQuestion = await this.questionRepository.create(params);

    const formatedResponse = {
      success: true,
      message: "Pergunta foi criada com sucesso",
      data: {
         ...newQuestion
      },
      count: 1,
      type: "Question"
  } 

  return formatedResponse
  }
}

export { CreateQuestionUseCase };

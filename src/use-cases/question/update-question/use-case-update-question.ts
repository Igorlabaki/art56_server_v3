import { UpdateQuestionRequestParams } from "../../../zod/question/update-question-params-schema"
import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error"
import { QuestionRepositoryInterface } from "../../../repositories/interface/question-repository-interface"
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"

class UpdateQuestionUseCase {
    constructor(private questionRepository: QuestionRepositoryInterface) { }

    async execute(param: UpdateQuestionRequestParams) {

        // Validate if question exists
        const question = await this.questionRepository.getById(param.questionId)

        if (!question) {
            throw new HttpResourceNotFoundError("Pergunta")
        }
        //

        const questionAlreadyExists = await this.questionRepository.getByQuestion({
            venueId: param.venueId,
            question: param.data.question,
            questionId: param.questionId
        });

        if (questionAlreadyExists) {
            throw new HttpConflictError("Essa pergunta ja esta cadastrada.")
        }

        const updatedQuestion = await this.questionRepository.update(param)

        if (!updatedQuestion) {
            throw new HttpConflictError("Pergunta")
        }

        const formatedResponse = {
            success: true,
            message: `Pergunta atualizado(a) com sucesso`,
            data: {
                ...updatedQuestion
            },
            count: 1,
            type: "Question"
        }

        return formatedResponse
    }
}

export { UpdateQuestionUseCase }

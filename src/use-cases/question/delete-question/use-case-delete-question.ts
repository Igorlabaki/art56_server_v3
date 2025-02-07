
import { DeleteQuestionRequestParamSchema } from "../../../zod/question/delete-question-param-schema"
import { QuestionRepositoryInterface } from "../../../repositories/interface/question-repository-interface"
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"

class DeleteQuestionUseCase {
    constructor(private questionRepository: QuestionRepositoryInterface) { }

    async execute({ questionId }: DeleteQuestionRequestParamSchema) {

        // Validate if question exists
        const question = await this.questionRepository.getById(questionId)

        if (!question) {
            throw new HttpResourceNotFoundError("Pergunta")
        }
        //

        const deletedQuestion = await this.questionRepository.delete(questionId)

        const formatedResponse = {
            success: true,
            message: `Pergunta deletada com sucesso`,
            data: {
                ...deletedQuestion
            },
            count: 1,
            type: "Question"
        }

        return formatedResponse
    }
}

export { DeleteQuestionUseCase }

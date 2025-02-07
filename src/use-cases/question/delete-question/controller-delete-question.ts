import { Request, Response } from "express"
import { DeleteQuestionUseCase } from "./use-case-delete-question";
import { handleErrors } from "../../../errors/error-handler";
import { deleteQuestionRequestParamSchema } from "../../../zod/question/delete-question-param-schema";


class DeleteQuestionController {
    constructor(private deleteQuestionUseCase: DeleteQuestionUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = deleteQuestionRequestParamSchema.parse(req.params);
            const questionById = await this.deleteQuestionUseCase.execute(param);
            
            return resp.json(questionById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { DeleteQuestionController }

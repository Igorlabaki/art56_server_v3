import { Request, Response } from "express"
import { UpdateQuestionUseCase } from "./use-case-update-question";
import { handleErrors } from "../../../errors/error-handler";
import { updateQuestionSchema } from "../../../zod/question/update-question-params-schema";

class UpdateQuestionController {
    constructor(private updateQuestionUseCase: UpdateQuestionUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = updateQuestionSchema.parse(req.body);

            const questionById = await this.updateQuestionUseCase.execute(param);
            
            return resp.json(questionById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdateQuestionController }

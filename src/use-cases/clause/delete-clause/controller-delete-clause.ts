import { Request, Response } from "express"
import { handleErrors } from "../../../errors/error-handler";
import { DeleteClauseUseCase } from "./use-case-delete-clause";
import { deleteClauseRequestParamSchema } from "../../../zod/clause/delete-clause-param-schema";


class DeleteClauseController {
    constructor(private deleteClauseUseCase: DeleteClauseUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = deleteClauseRequestParamSchema.parse(req.params);
            const clauseById = await this.deleteClauseUseCase.execute(param);
            
            return resp.json(clauseById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { DeleteClauseController }

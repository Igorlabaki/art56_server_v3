import { Request, Response } from "express"
import { handleErrors } from "../../../errors/error-handler";
import { UpdateClauseUseCase } from "./use-case-update-clause";
import { updateClauseSchema } from "../../../zod/clause/update-clause-params-schema";

class UpdateClauseController {
    constructor(private updateClauseUseCase: UpdateClauseUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = updateClauseSchema.parse(req.body);

            const clauseById = await this.updateClauseUseCase.execute(param);
            
            return resp.json(clauseById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdateClauseController }

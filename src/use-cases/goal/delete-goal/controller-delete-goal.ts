import { Request, Response } from "express"
import { DeleteGoalUseCase } from "./use-case-delete-goal";
import { handleErrors } from "../../../errors/error-handler";
import { deleteGoalRequestParamSchema } from "../../../zod/goal/delete-goal-param-schema";


class DeleteGoalController {
    constructor(private deleteGoalUseCase: DeleteGoalUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = deleteGoalRequestParamSchema.parse(req.params);
            const goalById = await this.deleteGoalUseCase.execute(param);
            
            return resp.json(goalById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { DeleteGoalController }

import { Request, Response } from "express"
import { UpdateGoalUseCase } from "./use-case-update-goal";
import { handleErrors } from "../../../errors/error-handler";
import { updateGoalSchema } from "../../../zod/goal/update-goal-params-schema";

class UpdateGoalController {
    constructor(private updateGoalUseCase: UpdateGoalUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = updateGoalSchema.parse(req.body);

            const goalById = await this.updateGoalUseCase.execute(param);
            
            return resp.json(goalById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdateGoalController }

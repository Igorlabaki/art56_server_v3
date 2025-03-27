import { Request, Response } from "express"
import { handleErrors } from "../../../errors/error-handler";
import { DeleteSeasonalFeeUseCase } from "./use-case-delete-seasonal-fee";
import { deleteSeasonalFeeRequestParamSchema } from "../../../zod/seasonalFee/delete-seasonal-fee-param-schema";

class DeleteSeasonalFeeController {
    constructor(private deleteSeasonalFeeUseCase: DeleteSeasonalFeeUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = deleteSeasonalFeeRequestParamSchema.parse(req.params);
            const seasonalfeeById = await this.deleteSeasonalFeeUseCase.execute(param);
            
            return resp.json(seasonalfeeById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { DeleteSeasonalFeeController }

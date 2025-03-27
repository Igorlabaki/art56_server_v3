import { Request, Response } from "express"
import { handleErrors } from "../../../errors/error-handler";
import { UpdateSeasonalFeeUseCase } from "./use-case-update-seasonal-fee";
import { updateSeasonalFeeSchema } from "../../../zod/seasonalFee/update-seasonal-fee-params-schema";

class UpdateSeasonalFeeController {
    constructor(private updateSeasonalFeeUseCase: UpdateSeasonalFeeUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = updateSeasonalFeeSchema.parse(req.body);

            const seasonalfeeById = await this.updateSeasonalFeeUseCase.execute(param);
            
            return resp.json(seasonalfeeById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdateSeasonalFeeController }

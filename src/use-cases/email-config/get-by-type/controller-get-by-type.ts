import { Request, Response } from "express"

import { handleErrors } from "../../../errors/error-handler";
import { getByTypeRequestQuerySchema } from "../../../zod/email-config/get-by-type-query-schema";
import { GetEmailConfigByTypeUseCase } from "./use-case-get-by-type";

class GetEmailConfigByTypeController {
    constructor(private getEmailConfigByTypeUseCase: GetEmailConfigByTypeUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const { venueId, type } = req.params;
            console.log(venueId, type);
            const param = getByTypeRequestQuerySchema.parse(req.params);
            const emailConfigByType = await this.getEmailConfigByTypeUseCase.execute(param);
            
            return resp.json(emailConfigByType)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { GetEmailConfigByTypeController }

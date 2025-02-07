import { Request, Response } from "express"

import { handleErrors } from "../../../errors/error-handler";
import { UpdateOwnerUseCase } from "./use-case-update-owner";
import { updateOwnerSchema } from "../../../zod/owner/update-owner-params-schema";

class UpdateOwnerController {
    constructor(private updateOwnerUseCase: UpdateOwnerUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = updateOwnerSchema.parse(req.body);

            const ownerById = await this.updateOwnerUseCase.execute(param);
            
            return resp.json(ownerById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdateOwnerController }

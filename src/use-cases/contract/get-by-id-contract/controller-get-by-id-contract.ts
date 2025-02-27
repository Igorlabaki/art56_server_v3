import { Request, Response } from "express"

import { handleErrors } from "../../../errors/error-handler";
import { GetContractByIdUseCase } from "./use-case-get-by-id-contract";
import { getContractByIdRequestParamSchema } from "../../../zod/contract/get-by-id-contract-param-schema";

class GetContractByIdController {
    constructor(private getContractByIdUseCase: GetContractByIdUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = getContractByIdRequestParamSchema.parse(req.params);
            const contractById = await this.getContractByIdUseCase.execute(param);
            
            return resp.status(200).json(contractById);
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { GetContractByIdController }

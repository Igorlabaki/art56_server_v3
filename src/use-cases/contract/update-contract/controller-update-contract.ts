import { Request, Response } from "express"
import { handleErrors } from "../../../errors/error-handler";
import { UpdateContractUseCase } from "./use-case-update-contract";
import { updateContractSchema } from "../../../zod/contract/update-contract-params-schema";

class UpdateContractController {
    constructor(private updateContractUseCase: UpdateContractUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = updateContractSchema.parse(req.body);

            const contractById = await this.updateContractUseCase.execute(param);
            
            return resp.json(contractById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdateContractController }

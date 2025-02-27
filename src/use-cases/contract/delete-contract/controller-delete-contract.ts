import { Request, Response } from "express"
import { handleErrors } from "../../../errors/error-handler";
import { DeleteContractUseCase } from "./use-case-delete-contract";
import { deleteContractRequestParamSchema } from "../../../zod/contract/delete-contract-param-schema";


class DeleteContractController {
    constructor(private deleteContractUseCase: DeleteContractUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = deleteContractRequestParamSchema.parse(req.params);
            const contractById = await this.deleteContractUseCase.execute(param);
            
            return resp.json(contractById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { DeleteContractController }

import { Request, Response } from "express"
import { handleErrors } from "../../../errors/error-handler";
import { DeleteOwnerUseCase } from "./use-case-delete-owner";
import { deleteOwnerSchema } from "../../../zod/owner/delete-owner-params-schema";


class DeleteOwnerController {
    constructor(private deleteOwnerUseCase: DeleteOwnerUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = deleteOwnerSchema.parse(req.params);
            const ownerById = await this.deleteOwnerUseCase.execute(param);
            
            return resp.json(ownerById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { DeleteOwnerController }

import { Request, Response } from "express"
import { handleErrors } from "../../../errors/error-handler";
import { GetUserPermissionByIdUseCase } from "./use-case-get-user-permission-id";
import { getByIdUserPermissionSchema } from "../../../zod/user-permission/get-by-id-user-permission-params-schema";

class GetUserPermissionByIdController {
    constructor(private getUserPermissionByIdUseCase: GetUserPermissionByIdUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const query = getByIdUserPermissionSchema.parse(req.query);
            const UserpermissionById = await this.getUserPermissionByIdUseCase.execute(query);
            
            return resp.json(UserpermissionById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { GetUserPermissionByIdController }

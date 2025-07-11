import { Request, Response } from "express"
import { handleErrors } from "../../../errors/error-handler";
import { GetUserPermissionUseCase } from "./use-case-get-user-permission-id";
import { getUserPermissionSchema } from "../../../zod/user-permission/get-user-permission-params-schema";


class GetUserPermissionController {
    constructor(private getUserPermissionUseCase: GetUserPermissionUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const query = getUserPermissionSchema.parse(req.query);
            const Userpermission = await this.getUserPermissionUseCase.execute(query);
            
            return resp.json(Userpermission)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { GetUserPermissionController }

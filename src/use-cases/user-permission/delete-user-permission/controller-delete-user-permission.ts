import { Request, Response } from "express"
import { handleErrors } from "../../../errors/error-handler";
import { DeleteUserPermissionUseCase } from "./use-case-delete-user-permission";
import { deleteUserPermissionRequestParamSchema } from "../../../zod/user-permission/delete-user-permission-param-schema";

class DeleteUserPermissionController {
    constructor(private deleteUserPermissionUseCase: DeleteUserPermissionUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = deleteUserPermissionRequestParamSchema.parse(req.params);
            const userpermissionById = await this.deleteUserPermissionUseCase.execute(param);
            return resp.status(200).json(userpermissionById);
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { DeleteUserPermissionController }

import { Request, Response } from "express"
import { handleErrors } from "../../../errors/error-handler";
import { DeleteUserOrganizationPermissionUseCase } from "./use-case-delete-user-organization-permission";
import { deleteUserOrganizationPermissionRequestParamSchema } from "../../../zod/user-organization-permission/delete-user-organization-permission-param-schema";

class DeleteUserOrganizationPermissionController {
    constructor(private deleteUserOrganizationPermissionUseCase: DeleteUserOrganizationPermissionUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = deleteUserOrganizationPermissionRequestParamSchema.parse(req.params);
            const userOrganizationPermissionById = await this.deleteUserOrganizationPermissionUseCase.execute(param);
            return resp.status(200).json(userOrganizationPermissionById);
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

    export { DeleteUserOrganizationPermissionController }

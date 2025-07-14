import { Request, Response } from "express"
import { handleErrors } from "../../../errors/error-handler";
import { GetUserOrganizationPermissionByIdUseCase } from "./use-case-get-user-organization-permission-id";
import { getByIdUserOrganizationPermissionSchema } from "../../../zod/user-organization-permission/get-by-id-user-organization-permission-params-schema";

class GetUserOrganizationPermissionByIdController {
    constructor(private getUserOrganizationPermissionByIdUseCase: GetUserOrganizationPermissionByIdUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const query = getByIdUserOrganizationPermissionSchema.parse(req.query);
            const UserpermissionById = await this.getUserOrganizationPermissionByIdUseCase.execute(query);
            
            return resp.json(UserpermissionById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { GetUserOrganizationPermissionByIdController }

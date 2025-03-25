import { Request, Response } from "express"
import { handleErrors } from "../../../errors/error-handler";
import { DeleteUserOrganizationUseCase } from "./use-case-delete-user-organization";
import { deleteUserOrganizationRequestParamSchema } from "../../../zod/user-organization/delete-user-organization-param-schema";

class DeleteUserOrganizationController {
    constructor(private deleteUserOrganizationUseCase: DeleteUserOrganizationUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = deleteUserOrganizationRequestParamSchema.parse(req.params);
            const userorganizationById = await this.deleteUserOrganizationUseCase.execute(param);
            
            return resp.json(userorganizationById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { DeleteUserOrganizationController }

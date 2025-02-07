import { Request, Response } from "express"

import { handleErrors } from "../../../errors/error-handler";
import { DeleteOrganizationUseCase } from "./use-case-delete-organization";
import { getByIdOrganizationSchema } from "../../../zod/organization/get-by-id-organization-params-schema";
import { deleteOrganizationSchema } from "../../../zod/organization/delete-organization-params-schema";


class DeleteOrganizationController {
    constructor(private deleteOrganizationUseCase: DeleteOrganizationUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = deleteOrganizationSchema.parse(req.params);
            const organizationById = await this.deleteOrganizationUseCase.execute(param);
            
            return resp.json(organizationById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { DeleteOrganizationController }

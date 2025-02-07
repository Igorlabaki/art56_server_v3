import { Request, Response } from "express"

import { handleErrors } from "../../../errors/error-handler";
import { UpdateOrganizationUseCase } from "./use-case-update-organization";
import { updateOrganizationSchema } from "../../../zod/organization/update-organization-params-schema";

class UpdateOrganizationController {
    constructor(private updateOrganizationUseCase: UpdateOrganizationUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = updateOrganizationSchema.parse(req.body);

            const organizationById = await this.updateOrganizationUseCase.execute(param);
            
            return resp.json(organizationById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdateOrganizationController }

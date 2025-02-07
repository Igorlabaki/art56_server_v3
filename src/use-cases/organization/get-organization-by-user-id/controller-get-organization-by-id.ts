import { Request, Response } from "express"

import { handleErrors } from "../../../errors/error-handler";
import { GetOrganizationByIdUseCase } from "./use-case-get-organization-by-id";
import { getByIdOrganizationSchema } from "../../../zod/organization/get-by-id-organization-params-schema";


class GetOrganizationByIdController {
    constructor(private getOrganizationByIdUseCase: GetOrganizationByIdUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const query = getByIdOrganizationSchema.parse(req.query);
            const organizationById = await this.getOrganizationByIdUseCase.execute(query);
            
            return resp.json(organizationById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { GetOrganizationByIdController }

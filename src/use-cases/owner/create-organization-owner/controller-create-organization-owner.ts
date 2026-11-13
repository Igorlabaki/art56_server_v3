import { Response } from "express";

import { CreateOrganizationOwnerUseCase } from "./use-case-create-organition-owner";
import { handleErrors } from "../../../errors/error-handler";
import { AuthenticatedRequest } from "../../../types/authenticated-request";
import { createOrganizationOwnerSchema } from "../../../zod/owner/create-owner-params-schema";

class CreateOrganizationOwnerController {
    constructor(private createOrganizationOwnerUseCase: CreateOrganizationOwnerUseCase) { }

    async handle(req: AuthenticatedRequest, resp: Response) {
        try {
            const body = createOrganizationOwnerSchema.parse(req.body);

            const response = await this.createOrganizationOwnerUseCase.execute(req.user?.id, body);
            return resp.status(201).json(response);

        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { CreateOrganizationOwnerController };

import { Request, Response } from "express";

import { CreateOrganizationOwnerUseCase } from "./use-case-create-organition-owner";
import { handleErrors } from "../../../errors/error-handler";
import { CreateOrganizationOwnerRequestParams, createOrganizationOwnerSchema } from "../../../zod/owner/create-owner-params-schema";

class CreateOrganizationOwnerController {
    constructor(private createOrganizationOwnerUseCase: CreateOrganizationOwnerUseCase) { }

    async handle(req: Request, resp: Response) {
        try {
            const body: CreateOrganizationOwnerRequestParams = req.body;
            // Validate the request parms
            createOrganizationOwnerSchema.parse(body);

            // Esperar a execução do caso de uso
            const response = await this.createOrganizationOwnerUseCase.execute(body);
            // Retornar o token
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
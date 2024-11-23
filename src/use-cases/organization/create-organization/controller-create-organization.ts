import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { CreateOrganizationRequestParams, createOrganizationSchema } from "../../../zod/organization/create-organization-params-schema";
import { CreateOrganizationUseCase } from "./use-case-create-organization";


class CreateOrganizationController {
    constructor(private createOrganizationUseCase: CreateOrganizationUseCase) { }

    async handle(req: Request, resp: Response) {
        try {
            const body: CreateOrganizationRequestParams = req.body;
            // Validate the request parms
            createOrganizationSchema.parse(body);

            // Esperar a execução do caso de uso
            const response = await this.createOrganizationUseCase.execute(body);
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

export { CreateOrganizationController };
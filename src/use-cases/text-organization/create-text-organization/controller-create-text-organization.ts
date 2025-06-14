import { Request, Response } from "express";
import { CreateTextOrganizationSchema } from "../../../zod/text-organization/create-text-organization-params-schema";
import { handleErrors } from "../../../errors/error-handler";
import { CreateTextOrganizationUseCase } from "./use-case-create-text-organization";
import { createTextOrganizationSchema } from "../../../zod/text-organization/create-text-organization-params-schema";

class CreateTextOrganizationController {
  constructor(private createTextOrganizationUseCase: CreateTextOrganizationUseCase) {}

  async handle(req: Request, resp: Response) {
    try {
        const body: CreateTextOrganizationSchema = req.body;
        // Validate the request parms
        createTextOrganizationSchema.parse(body);

        // Esperar a execução do caso de uso
        const response = await this.createTextOrganizationUseCase.execute(body);
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

export { CreateTextOrganizationController };

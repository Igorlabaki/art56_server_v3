import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { CreateUserOrganizationUseCase } from "./use-case-create-user-organization";
import { CreateUserOrganizationRequestParams, createUserOrganizationSchema } from "../../../zod/user-organization/create-user-organization-params-schema";

class CreateUserOrganizationController {
  constructor(private createUserOrganizationCase: CreateUserOrganizationUseCase
  ) {}

  async handle(req: Request, resp: Response) {
    try {
        const body: CreateUserOrganizationRequestParams = req.body;
        // Validate the request parms
        createUserOrganizationSchema.parse(body);

        // Esperar a execução do caso de uso
        const response = await this.createUserOrganizationCase.execute(body);
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

export { CreateUserOrganizationController };

import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { CreateUserOrganizationPermissionUseCase } from "./use-case-create-user-organization-permission";
import { CreateUserOrganizationPermissionRequestParams, createUserOrganizationPermissionSchema } from "../../../zod/user-organization-permission/create-user-organization-permission-params-schema";

class CreateUserOrganizationPermissionController {
  constructor(private createUserOrganizationPermissionCase: CreateUserOrganizationPermissionUseCase
  ) {}

  async handle(req: Request, resp: Response) {
    try {
        const body: CreateUserOrganizationPermissionRequestParams = req.body;
        // Validate the request parms
        createUserOrganizationPermissionSchema.parse(body);

        // Esperar a execução do caso de uso
        const response = await this.createUserOrganizationPermissionCase.execute(body);
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

export { CreateUserOrganizationPermissionController };

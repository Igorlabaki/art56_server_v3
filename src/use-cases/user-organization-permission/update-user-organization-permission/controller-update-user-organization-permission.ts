import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { UpdateUserOrganizationPermissionRequestParams, updateUserOrganizationPermissionSchema } from "../../../zod/user-organization-permission/update-user-organization-permission-params-schema";
import { UpdateUserOrganizationPermissionUseCase } from "./use-case-update-user-organization-permission";

class UpdateUserOrganizationPermissionController {
  constructor(private updateUserOrganizationPermissionCase: UpdateUserOrganizationPermissionUseCase
  ) {}

  async handle(req: Request, resp: Response) {
    try {
        const body: UpdateUserOrganizationPermissionRequestParams = req.body;
        // Validate the request parms
        updateUserOrganizationPermissionSchema.parse(body);

        // Esperar a execução do caso de uso
        const response = await this.updateUserOrganizationPermissionCase.execute(body);
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

export { UpdateUserOrganizationPermissionController };

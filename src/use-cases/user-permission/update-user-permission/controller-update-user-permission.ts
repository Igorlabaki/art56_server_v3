import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { UpdateUserPermissionUseCase } from "./use-case-update-user-permission";
import { UpdateUserPermissionRequestParams, updateUserPermissionSchema } from "../../../zod/user-permission/update-user-permission-params-schema";

class UpdateUserPermissionController {
  constructor(private updateUserPermissionCase: UpdateUserPermissionUseCase
  ) {}

  async handle(req: Request, resp: Response) {
    try {
        const body: UpdateUserPermissionRequestParams = req.body;
        // Validate the request parms
        updateUserPermissionSchema.parse(body);

        // Esperar a execução do caso de uso
        const response = await this.updateUserPermissionCase.execute(body);
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

export { UpdateUserPermissionController };

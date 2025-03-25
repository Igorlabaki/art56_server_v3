import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { CreateUserPermissionUseCase } from "./use-case-create-user-permission";
import { CreateUserPermissionRequestParams, createUserPermissionSchema } from "../../../zod/user-permission/create-user-permission-params-schema";

class CreateUserPermissionController {
  constructor(private createUserPermissionCase: CreateUserPermissionUseCase
  ) {}

  async handle(req: Request, resp: Response) {
    try {
        const body: CreateUserPermissionRequestParams = req.body;
        // Validate the request parms
        createUserPermissionSchema.parse(body);

        // Esperar a execução do caso de uso
        const response = await this.createUserPermissionCase.execute(body);
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

export { CreateUserPermissionController };

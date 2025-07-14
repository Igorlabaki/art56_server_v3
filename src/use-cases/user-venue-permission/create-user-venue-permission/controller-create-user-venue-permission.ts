import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { CreateUserVenuePermissionUseCase } from "./use-case-create-user-venue-permission";
import { CreateUserVenuePermissionRequestParams, createUserVenuePermissionSchema } from "../../../zod/user-venue-permission/create-user-venue-permission-params-schema";

class CreateUserVenuePermissionController {
  constructor(private createUserVenuePermissionCase: CreateUserVenuePermissionUseCase
  ) {}

  async handle(req: Request, resp: Response) {
    try {
        const body: CreateUserVenuePermissionRequestParams = req.body;
        // Validate the request parms
        createUserVenuePermissionSchema.parse(body);

        // Esperar a execução do caso de uso
        const response = await this.createUserVenuePermissionCase.execute(body);
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

export { CreateUserVenuePermissionController };

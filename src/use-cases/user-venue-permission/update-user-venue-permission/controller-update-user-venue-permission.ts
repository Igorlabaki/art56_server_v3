import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { UpdateUserVenuePermissionUseCase } from "./use-case-update-user-venue-permission";
import { UpdateUserVenuePermissionRequestParams, updateUserVenuePermissionSchema } from "../../../zod/user-venue-permission/update-user-venue-permission-params-schema";

class UpdateUserVenuePermissionController {
  constructor(private updateUserVenuePermissionCase: UpdateUserVenuePermissionUseCase
  ) {}

  async handle(req: Request, resp: Response) {
    try {
        const body: UpdateUserVenuePermissionRequestParams = req.body;
        // Validate the request parms
        updateUserVenuePermissionSchema.parse(body);

        // Esperar a execução do caso de uso
        const response = await this.updateUserVenuePermissionCase.execute(body);
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

export { UpdateUserVenuePermissionController };

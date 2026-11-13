import { Response } from "express";

import { handleErrors } from "../../../errors/error-handler";
import { CreateVenueOwnerUseCase } from "./use-case-create-venue-owner";
import { AuthenticatedRequest } from "../../../types/authenticated-request";
import { createVenueOwnerSchema } from "../../../zod/owner/create-venue-owner-params-schema";


class CreateVenueOwnerController {
    constructor(private createVenueOwnerUseCase: CreateVenueOwnerUseCase) { }

    async handle(req: AuthenticatedRequest, resp: Response) {
        try {
            const body = createVenueOwnerSchema.parse(req.body);

            const response = await this.createVenueOwnerUseCase.execute(req.user?.id, body);
            return resp.status(201).json(response);

        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { CreateVenueOwnerController };

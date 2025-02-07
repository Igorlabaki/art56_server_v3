import { Request, Response } from "express";

import { handleErrors } from "../../../errors/error-handler";
import { CreateVenueOwnerUseCase } from "./use-case-create-venue-owner";
import { CreateVenueOwnerRequestParams, createVenueOwnerSchema } from "../../../zod/owner/create-venue-owner-params-schema";


class CreateVenueOwnerController {
    constructor(private createVenueOwnerUseCase: CreateVenueOwnerUseCase) { }

    async handle(req: Request, resp: Response) {
        try {
            const body: CreateVenueOwnerRequestParams = req.body;
            // Validate the request parms
            createVenueOwnerSchema.parse(body);

            // Esperar a execução do caso de uso
            const response = await this.createVenueOwnerUseCase.execute(body);
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

export { CreateVenueOwnerController };
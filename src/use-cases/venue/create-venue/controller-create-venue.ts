import { Request, Response } from "express";
import { CreateVenueUseCase } from "./use-case-create-venue";
import { handleErrors } from "../../../errors/error-handler";
import { CreateVenueRequestParams, createVenueSchema } from "../../../zod/venue/create-venue-params-schema";

class CreateVenueController {
    constructor(private createVenueUseCase: CreateVenueUseCase) { }

    async handle(req: Request, resp: Response) {
        try {
            const body: CreateVenueRequestParams = req.body;
            // Validate the request parms
            createVenueSchema.parse(body);

            // Esperar a execução do caso de uso
            const response = await this.createVenueUseCase.execute(body);
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

export { CreateVenueController };
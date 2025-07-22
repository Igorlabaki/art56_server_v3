
import { handleErrors } from "../../../errors/error-handler";

import { VenueRepositoryInterface } from "../../../repositories/interface/venue-repository-interface";

import { Request, Response } from "express";
import { UpdateVenueInfoSchemaDb, updateVenueInfoSchemaDb } from "../../../zod/venue/update-info-venue-params-schema";
import { UpdateInfoVenueUseCase } from "./use-case-update-info-venue";

class UpdateVenueInfoController {
    constructor(
        private updateVenueInfoUseCase: UpdateInfoVenueUseCase,
        private venueRepository: VenueRepositoryInterface
    ) { }

    async handle(req: Request, resp: Response) {
        try {
            const param = updateVenueInfoSchemaDb.parse(req.body);

            const response = await this.updateVenueInfoUseCase.execute(param);
            return resp.status(201).json(response);
        } catch (error) {
            console.log("error", error)
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdateVenueInfoController }

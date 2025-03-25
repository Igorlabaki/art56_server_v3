import { Request, Response } from "express"

import { handleErrors } from "../../../errors/error-handler";
import { UpdateVenueUseCase } from "./use-case-update-venue";
import { updateVenueSchema } from "../../../zod/venue/update-venue-params-schema";

class UpdateVenueController {
    constructor(private updateVenueUseCase: UpdateVenueUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = updateVenueSchema.parse(req.body);
            
            const venueById = await this.updateVenueUseCase.execute(param);
            return resp.json(venueById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);
            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdateVenueController }

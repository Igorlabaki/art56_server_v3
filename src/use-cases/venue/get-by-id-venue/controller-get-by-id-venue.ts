import { Request, Response } from "express"

import { handleErrors } from "../../../errors/error-handler";
import { GetVenueByIdUseCase } from "./use-case-get-by-id-venue";
import { getVenueByIdRequestParamSchema } from "../../../zod/venue/get-by-id-venue-param-schema";
import { getSelectedVenueRequestParamSchema } from "../../../zod/venue/get-selected-venue-param-schema";

class GetVenueByIdController {
    constructor(private getVenueByIdUseCase: GetVenueByIdUseCase) { }
    async handle(req: Request, resp: Response) {
        console.log(req.query)
        try {
            const query = getSelectedVenueRequestParamSchema.parse(req.query);
            const venueById = await this.getVenueByIdUseCase.execute(query);
            
            return resp.status(200).json(venueById);
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { GetVenueByIdController }

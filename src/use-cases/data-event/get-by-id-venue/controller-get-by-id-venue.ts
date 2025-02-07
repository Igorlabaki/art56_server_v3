import { Request, Response } from "express"

import { handleErrors } from "../../../errors/error-handler";
import { GetVenueByIdUseCase } from "./use-case-get-by-id-venue";
import { getVenueByIdRequestParamSchema } from "../../../zod/venue/get-by-id-venue-param-schema";

class GetVenueByIdController {
    constructor(private getVenueByIdUseCase: GetVenueByIdUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = getVenueByIdRequestParamSchema.parse(req.params);
            const venueById = await this.getVenueByIdUseCase.execute(param);
            
            return resp.json(venueById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { GetVenueByIdController }

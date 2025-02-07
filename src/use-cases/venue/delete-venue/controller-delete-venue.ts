import { Request, Response } from "express"

import { handleErrors } from "../../../errors/error-handler";
import { DeleteVenueUseCase } from "./use-case-delete-venue";
import { deleteVenueRequestParamSchema } from "../../../zod/venue/delete-venue-param-schema";


class DeleteVenueController {
    constructor(private deleteVenueUseCase: DeleteVenueUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = deleteVenueRequestParamSchema.parse(req.params);
            const venueById = await this.deleteVenueUseCase.execute(param);
            
            return resp.json(venueById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { DeleteVenueController }

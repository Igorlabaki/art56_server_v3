import { Request, Response } from "express"
import { GetVenueByIdUseCase } from "../venue/get-by-id-venue/use-case-get-by-id-venue";
import { getSelectedVenueRequestParamSchema } from "../../zod/venue/get-selected-venue-param-schema";
import { handleErrors } from "../../errors/error-handler";
import { GetWebDataUseCase } from "./use-case-get-web-data";

class GetWebDataController {
    constructor(private getWebDataUseCase: GetWebDataUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const query = getSelectedVenueRequestParamSchema.parse(req.query);
            const WebData = await this.getWebDataUseCase.execute(query);
            
            return resp.status(200).json(WebData);
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { GetWebDataController }

import { Request, Response } from "express"
import { handleErrors } from "../../../errors/error-handler";
import { GetVenueTrafficCountUseCase } from "./use-case-get-traffic-count-venue";
import { getTrafficCountVenueSchema } from "../../../zod/venue/get-venue-traffic-count-params-schema";

class GetVenueTrafficCountController {
    constructor(private getVenueTrafficCountUseCase: GetVenueTrafficCountUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            console.log("req.query", req.query)
            const param = getTrafficCountVenueSchema.parse(req.query);
            const trafficCountData = await this.getVenueTrafficCountUseCase.execute(param);
            console.log("trafficCountData", trafficCountData)
            return resp.status(200).json(trafficCountData);
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { GetVenueTrafficCountController }

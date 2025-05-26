import { Request, Response } from "express"
import { handleErrors } from "../../../errors/error-handler";
import { GetVenueAnalysisByMonthUseCase } from "./use-case-get-analysis-by-month-venue";
import { getVenueAnalysisByMonthSchema } from "../../../zod/venue/get-venue-analysis-by-month-params-schema";

class GetVenueAnalysiByMonthController {
    constructor(private getVenueAnalysiByMonthUseCase: GetVenueAnalysisByMonthUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            console.log("req.query", req.query)
            const param = getVenueAnalysisByMonthSchema.parse(req.query);
            const analysiByMonthData = await this.getVenueAnalysiByMonthUseCase.execute(param);
            
            return resp.status(200).json(analysiByMonthData);
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { GetVenueAnalysiByMonthController }

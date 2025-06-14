
import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { getHubDataRequestParamSchema } from "../../../zod/venue/get-hub-data-request-param";
import { GetHubDataUseCase } from "./use-case-get-web-data";


class GetHubDataController {
    constructor(private getHubDataUseCase: GetHubDataUseCase) { }
    async handle(req: Request   , resp: Response) {
        try {
            const query = getHubDataRequestParamSchema.parse(req.query);
            const hubData = await this.getHubDataUseCase.execute(query);
            
            return resp.status(200).json(hubData);
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { GetHubDataController }

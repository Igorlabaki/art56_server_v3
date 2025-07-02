
import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { GetOrganzationWebDataUseCase } from "./use-case-get-web-organizationdata";
import { getOrganziationWebDataRequestParamSchema } from "../../../zod/organization/get-web-data-param-schema";

class GetOrganziationWebDataController {
    constructor(private getOrganzationWebDataUseCase: GetOrganzationWebDataUseCase) { }
    async handle(req: Request   , resp: Response) {
        try {
            const query = getOrganziationWebDataRequestParamSchema.parse(req.query);
            const WebData = await this.getOrganzationWebDataUseCase.execute(query);
            
            return resp.status(200).json(WebData);
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { GetOrganziationWebDataController }

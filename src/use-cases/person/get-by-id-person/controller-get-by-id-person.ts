import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { GetByIdPersonUseCase } from "./use-case-get-by-id-person";
import { getbyidPersonRequestParamSchema } from "../../../zod/person/get-by-id-person-param-schema";


class GetByIdPersonController {
    constructor(private getbyidPersonUseCase: GetByIdPersonUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = getbyidPersonRequestParamSchema.parse(req.params);
            const personById = await this.getbyidPersonUseCase.execute(param);
            
            return resp.json(personById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { GetByIdPersonController }

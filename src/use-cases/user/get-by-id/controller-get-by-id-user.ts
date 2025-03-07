import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { GetByIdUserUseCase } from "./use-case-get-by-id-user";
import { getbyidUserRequestParamSchema } from "../../../zod/user/get-by-id-user-param-schema";


class GetByIdUserController {
    constructor(private getbyidUserUseCase: GetByIdUserUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = getbyidUserRequestParamSchema.parse(req.params);
            const userById = await this.getbyidUserUseCase.execute(param);
            
            return resp.json(userById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { GetByIdUserController }

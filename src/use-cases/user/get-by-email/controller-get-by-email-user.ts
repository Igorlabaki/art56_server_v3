import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { GetByEmailUserUseCase } from "./use-case-get-by-email-user";
import { getbyemailUserRequestParamSchema } from "../../../zod/user/get-by-email-user-param-schema";


class GetByEmailUserController {
    constructor(private getbyemailUserUseCase: GetByEmailUserUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = getbyemailUserRequestParamSchema.parse(req.query);
            const userByEmail = await this.getbyemailUserUseCase.execute(param);
            
            return resp.status(201).json(userByEmail)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { GetByEmailUserController }

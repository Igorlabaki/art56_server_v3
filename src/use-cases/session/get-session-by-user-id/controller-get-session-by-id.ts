import { Request, Response } from "express"

import { handleErrors } from "../../../errors/error-handler";
import { GetSessionByUserIdUseCase } from "./use-case-get-session-user-by-id";
import { getSessionByUserIdSchema } from "../../../zod/auth/get-session-by-user-id-params-schema copy 2"

class GetSessionByUserIdController {
    constructor(private getSessionByUserIdUseCase: GetSessionByUserIdUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const params = getSessionByUserIdSchema.parse(req.params);

            const sessionByUserId = await this.getSessionByUserIdUseCase.execute(params.userId);

            return resp.json(sessionByUserId)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { GetSessionByUserIdController }

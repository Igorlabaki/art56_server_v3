import { Request, Response } from "express"

import { handleErrors } from "../../errors/error-handler";
import { RefreshTokenUseCase } from "./use-case-refresh-token";
import { refreshTokenSchema } from "../../zod/refresh-token-params-schema";

class RefreshTokenController {
    constructor(private refreshTokenUseCase: RefreshTokenUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const params = refreshTokenSchema.parse(req.body);

            const refreshToken = await this.refreshTokenUseCase.execute(params.accessToken);

            return resp.json(refreshToken)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { RefreshTokenController }

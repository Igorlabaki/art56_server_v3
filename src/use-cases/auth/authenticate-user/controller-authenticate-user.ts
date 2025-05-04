import { Request, Response } from "express"
import { AuthenticateUserUseCase } from "./use-case-authenticate-user"
import { AuthenticateUserRequestParams, authenticateUserSchema } from "../../../zod/auth/authenticate-user-params-schema";
import { handleErrors } from "../../../errors/error-handler";

class AuthenticateUserController {
    constructor(private authenticateUserUseCase: AuthenticateUserUseCase) { }

    async handle(req: Request, resp: Response) {
        try {
            const body: AuthenticateUserRequestParams = req.body
            console.log(body)
            authenticateUserSchema.parse(body);

            const token = await this.authenticateUserUseCase.execute(body)

            return resp.json(token)

        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { AuthenticateUserController }
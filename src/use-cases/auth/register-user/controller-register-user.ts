import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { RegisterUserUseCase } from "./use-case-register-user";
import { RegisterUserRequestParams, RegisterUserSchema } from "../../../zod/register-user-params-schema";

class RegisterUserController {
    constructor(private registerUserUseCase: RegisterUserUseCase) { }

    async handle(req: Request, resp: Response) {
        try {
            const body: RegisterUserRequestParams = req.body;
            // Validate the request parms
            RegisterUserSchema.parse(body);

            // Esperar a execução do caso de uso
            const response = await this.registerUserUseCase.execute(body);
            // Retornar o token
            return resp.json(response);

        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { RegisterUserController };
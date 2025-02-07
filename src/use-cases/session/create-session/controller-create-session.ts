import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { CreateSessionUseCase } from "./use-case-create-session";
import { CreateSessionRequestParams, CreateSessionSchema } from "../../../zod/auth/create-session-params-schema";


class CreateSessionController {
    constructor(private createSessionUseCase: CreateSessionUseCase) { }

    async handle(req: Request, resp: Response) {
        try {
            const body: CreateSessionRequestParams = req.body;
            // Validate the request parms
            CreateSessionSchema.parse(body);

            // Esperar a execução do caso de uso
            const response = await this.createSessionUseCase.execute(body);
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

export { CreateSessionController };
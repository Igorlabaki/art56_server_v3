import { Request, Response } from "express";

import { CreateOwnerUseCase } from "./use-case-create-owner";
import { handleErrors } from "../../../errors/error-handler";
import { CreateOwnerRequestParams, createOwnerSchema } from "../../../zod/owner/create-owner-params-schema";

class CreateOwnerController {
    constructor(private createOwnerUseCase: CreateOwnerUseCase) { }

    async handle(req: Request, resp: Response) {
        try {
            const body: CreateOwnerRequestParams = req.body;
            // Validate the request parms
            createOwnerSchema.parse(body);

            // Esperar a execução do caso de uso
            const response = await this.createOwnerUseCase.execute(body);
            // Retornar o token
            return resp.status(201).json(response);

        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { CreateOwnerController };
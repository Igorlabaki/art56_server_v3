import { Request, Response } from "express";


import { handleErrors } from "../../../errors/error-handler";
import { CreateProposalUseCase } from "./use-case-create-proposal";
import { createProposalRequestParamsSchema, CreateProposalRequestParamsSchema,  } from "../../../zod/proposal/create-proposal-params-schema";

class CreateProposalController {
    constructor(private createProposalUseCase: CreateProposalUseCase) { }

    async handle(req: Request, resp: Response) {
        try {
            const body: CreateProposalRequestParamsSchema = req.body;
            // Validate the request parms
            createProposalRequestParamsSchema.parse(body);

            // Esperar a execução do caso de uso
            const response = await this.createProposalUseCase.execute(body);
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

export { CreateProposalController };
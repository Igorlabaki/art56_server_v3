import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { CreateProposalPerPersonUseCase } from "./use-case-create-proposal-per-person";
import { createProposalPerPersonRequestParamsSchema, CreateProposalPerPersonRequestParamsSchema,  } from "../../../zod/proposal/create-proposal-per-person-params-schema";

class CreateProposalPerPersonController {
    constructor(private createProposalPerPersonUseCase: CreateProposalPerPersonUseCase) { }

    async handle(req: Request, resp: Response) {
        try {
            const body: CreateProposalPerPersonRequestParamsSchema = req.body;
            
            // Validate the request parms
            createProposalPerPersonRequestParamsSchema.safeParse(body);
            // Esperar a execução do caso de uso
            const response = await this.createProposalPerPersonUseCase.execute(body);
            // Retornar o token
            return resp.status(201).json(response);

        } catch (error) {
            console.log("Erros",error)
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);
            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { CreateProposalPerPersonController };
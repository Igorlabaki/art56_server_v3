import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { CreateProposalPerDayUseCase } from "./use-case-create-proposal-per-day";
import { createProposalPerDayRequestParamsSchema, CreateProposalPerDayRequestParamsSchema } from "../../../zod/proposal/create-proposal-per-day-params-schema";

class CreateProposalPerDayController {
    constructor(private createProposalPerDayUseCase: CreateProposalPerDayUseCase) { }

    async handle(req: Request, resp: Response) {
        try {
            const body: CreateProposalPerDayRequestParamsSchema = req.body;
            // Validate the request parms
            createProposalPerDayRequestParamsSchema.parse(body);

            // Esperar a execução do caso de uso
            const response = await this.createProposalPerDayUseCase.execute(body);
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

export { CreateProposalPerDayController };
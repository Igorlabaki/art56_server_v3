import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { CreateProposalPerDayUseCase } from "./use-case-create-proposal-per-day";
import { createProposalPerDayRequestParamsSchema, CreateProposalPerDayRequestParamsSchema } from "../../../zod/proposal/create-proposal-per-day-params-schema";

class CreateProposalPerDayController {
    constructor(private createProposalPerDayUseCase: CreateProposalPerDayUseCase) { }

    async handle(req: Request, resp: Response) {
        try {
            console.log("[Controller] Iniciando criação de proposta por dia");
           
            const body: CreateProposalPerDayRequestParamsSchema = req.body;
            console.log("[Controller] Dados recebidos:", JSON.stringify(body, null, 2));

            // Validate the request parms
            console.log("[Controller] Validando parâmetros da requisição");
            createProposalPerDayRequestParamsSchema.parse(body);
            console.log("[Controller] Parâmetros validados com sucesso");

            // Esperar a execução do caso de uso
            console.log("[Controller] Executando caso de uso");
            const response = await this.createProposalPerDayUseCase.execute(body);
            console.log("[Controller] Caso de uso executado com sucesso");

            // Retornar o token
            console.log("[Controller] Retornando resposta");
            return resp.status(201).json(response);

        } catch (error) {
            console.error("[Controller] Erro capturado:", error);
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);
            console.log("[Controller] Erro formatado:", errorResponse);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { CreateProposalPerDayController };
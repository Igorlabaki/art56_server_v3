import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { CreateDateEventUseCase } from "./use-case-create-date-event";
import { createSameDayDateEventRequestParmsSchema, CreateSameDayDateEventRequestParmsSchema } from "../../../zod/dataEvent/create-same-day-date-event-request-params-schema";

class CreateDateController {
    constructor(private createDateUseCase: CreateDateEventUseCase) { }

    async handle(req: Request, resp: Response) {
        try {
            const body: CreateSameDayDateEventRequestParmsSchema = req.body;
            // Validate the request parms
            createSameDayDateEventRequestParmsSchema.parse(body);
          
            // Esperar a execução do caso de uso
            const response = await this.createDateUseCase.execute(body);
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

export { CreateDateController };
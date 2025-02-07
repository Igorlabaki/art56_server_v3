import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { CreateOvernightDateEventUseCase } from "./use-case-create-overnigth-date-event";
import { createOvernigthDateEventRequestParmsSchema, CreateOvernigthDateEventRequestParmsSchema } from "../../../zod/dataEvent/create-overnithg-date-event-request-params-schema";

class CreateOvernightDateController {
    constructor(private createOvernightDateEventUseCase: CreateOvernightDateEventUseCase) { }

    async handle(req: Request, resp: Response) {
        try {
            const body: CreateOvernigthDateEventRequestParmsSchema = req.body;
            // Validate the request parms
            createOvernigthDateEventRequestParmsSchema.parse(body);
          
            // Esperar a execução do caso de uso
            const response = await this.createOvernightDateEventUseCase.execute(body);
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

export { CreateOvernightDateController };
import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { CreateScheduleUseCase } from "./use-case-create-schedule";
import { CreateScheduleRequestParams, createScheduleSchema } from "../../../zod/schedule/create-schedule-params-schema";

class CreateScheduleController {
  constructor(private createScheduleUseCase: CreateScheduleUseCase) {}

  async handle(req: Request, resp: Response) {
    try {
        const body: CreateScheduleRequestParams = req.body;
        // Validate the request parms
        createScheduleSchema.parse(body);

        // Esperar a execução do caso de uso
        const response = await this.createScheduleUseCase.execute(body);
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

export { CreateScheduleController };

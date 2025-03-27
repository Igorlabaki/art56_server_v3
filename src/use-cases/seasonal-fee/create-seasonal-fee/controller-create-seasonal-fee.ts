import { Request, Response } from "express";

import { handleErrors } from "../../../errors/error-handler";
import { CreateSeasonalFeeUseCase } from "./use-case-create-seasonal-fee";
import { CreateSeasonalFeeRequestParams, createSeasonalFeeSchema } from "../../../zod/seasonalFee/create-seasonal-fee-params-schema";

class CreateSeasonalFeeController {
  constructor(private createSeasonalFeeUseCase: CreateSeasonalFeeUseCase) {}

  async handle(req: Request, resp: Response) {
    try {
        const body: CreateSeasonalFeeRequestParams = req.body;
        // Validate the request parms
        createSeasonalFeeSchema.parse(body);

        // Esperar a execução do caso de uso
        const response = await this.createSeasonalFeeUseCase.execute(body);
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

export { CreateSeasonalFeeController };

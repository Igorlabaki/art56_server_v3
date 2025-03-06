import { Request, Response } from "express";
import { CreateTextUseCase } from "./use-case-create-text";
import { CreateTextRequestParams, createTextSchema } from "../../../zod/text/create-text-params-schema";
import { handleErrors } from "../../../errors/error-handler";

class CreateTextController {
  constructor(private createTextUseCase: CreateTextUseCase) {}

  async handle(req: Request, resp: Response) {
    try {
        const body: CreateTextRequestParams = req.body;
        // Validate the request parms
        createTextSchema.parse(body);

        // Esperar a execução do caso de uso
        const response = await this.createTextUseCase.execute(body);
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

export { CreateTextController };

import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { CreateClauseUseCase } from "./use-case-create-clause";
import { CreateClauseRequestParams, createClauseSchema } from "../../../zod/clause/create-clause-params-schema";

class CreateClauseController {
  constructor(private createClauseUseCase: CreateClauseUseCase) {}

  async handle(req: Request, resp: Response) {
    try {
        const body: CreateClauseRequestParams = req.body;
        // Validate the request parms
        createClauseSchema.parse(body);

        // Esperar a execução do caso de uso
        const response = await this.createClauseUseCase.execute(body);
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

export { CreateClauseController };

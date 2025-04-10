import { Request, Response } from "express";
import { CreateGoalUseCase } from "./use-case-create-goal";
import { handleErrors } from "../../../errors/error-handler";
import { CreateGoalRequestParams, createGoalSchema } from "../../../zod/goal/create-goal-params-schema";

class CreateGoalController {
  constructor(private createGoalUseCase: CreateGoalUseCase) {}

  async handle(req: Request, resp: Response) {
    try {
        const body: CreateGoalRequestParams = req.body;
        // Validate the request parms
        createGoalSchema.parse(body);

        // Esperar a execução do caso de uso
        const response = await this.createGoalUseCase.execute(body);
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

export { CreateGoalController };

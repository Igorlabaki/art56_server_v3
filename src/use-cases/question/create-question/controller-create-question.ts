import { Request, Response } from "express";
import { CreateQuestionUseCase } from "./use-case-create-question";
import { CreateQuestionRequestParams, createQuestionSchema } from "../../../zod/question/create-question-params-schema";
import { handleErrors } from "../../../errors/error-handler";

class CreateQuestionController {
  constructor(private createQuestionUseCase: CreateQuestionUseCase) {}

  async handle(req: Request, resp: Response) {
    try {
        const body: CreateQuestionRequestParams = req.body;
        // Validate the request parms
        createQuestionSchema.parse(body);

        // Esperar a execução do caso de uso
        const response = await this.createQuestionUseCase.execute(body);
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

export { CreateQuestionController };

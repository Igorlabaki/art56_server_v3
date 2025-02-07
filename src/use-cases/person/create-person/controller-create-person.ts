import { Request, Response } from "express";
import { CreatePersonUseCase } from "./use-case-create-person";
import { handleErrors } from "../../../errors/error-handler";
import { CreatePersonRequestParams, createPersonSchema } from "../../../zod/person/create-person-params-schema";

class CreatePersonController {
  constructor(private createPersonUseCase: CreatePersonUseCase) {}

  async handle(req: Request, resp: Response) {
    try {
        const body: CreatePersonRequestParams = req.body;
        // Validate the request parms
        createPersonSchema.parse(body);

        // Esperar a execução do caso de uso
        const response = await this.createPersonUseCase.execute(body);
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

export { CreatePersonController };

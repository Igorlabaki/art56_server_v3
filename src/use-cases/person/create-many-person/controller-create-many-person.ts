import { Request, Response } from "express";
import { CreateManyPersonUseCase } from "./use-case-create-many-person";
import { handleErrors } from "../../../errors/error-handler";
import { CreateManyPersonSchema, createManyPersonSchema} from "../../../zod/person/create-many-person-params-schema";

class CreateManyPersonController {
  constructor(private createmanyPersonUseCase: CreateManyPersonUseCase) {}

  async handle(req: Request, resp: Response) {
    try {
        const body: CreateManyPersonSchema = req.body;
        // Validate the request parms
        createManyPersonSchema.parse(body);

        // Esperar a execução do caso de uso
        const response = await this.createmanyPersonUseCase.execute(body);
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

export { CreateManyPersonController };

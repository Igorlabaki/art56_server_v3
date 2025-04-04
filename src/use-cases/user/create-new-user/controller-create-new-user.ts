import { Request, Response } from "express";
import { CreateUserRequestParams, createUserSchema } from "../../../zod/user/create-user-params-schema";
import { handleErrors } from "../../../errors/error-handler";
import { CreateNewUserUseCase } from "./use-case-create-new-user";

class CreateNewUserController {
  constructor(private createUserUseCase: CreateNewUserUseCase) {}

  async handle(req: Request, resp: Response) {
    try {
        const body: CreateUserRequestParams = req.body;
        // Validate the request parms
        createUserSchema.parse(body);

        // Esperar a execução do caso de uso
        const response = await this.createUserUseCase.execute(body);
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

export { CreateNewUserController };

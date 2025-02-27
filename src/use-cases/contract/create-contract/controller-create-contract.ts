import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { CreateContractUseCase } from "./use-case-create-contract";
import { CreateContractRequestParams, createContractSchema } from "../../../zod/contract/create-contract-params-schema";

class CreateContractController {
  constructor(private createContractUseCase: CreateContractUseCase) {}

  async handle(req: Request, resp: Response) {
    try {
        const body: CreateContractRequestParams = req.body;
        // Validate the request parms
        createContractSchema.parse(body);

        // Esperar a execução do caso de uso
        const response = await this.createContractUseCase.execute(body);
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

export { CreateContractController };

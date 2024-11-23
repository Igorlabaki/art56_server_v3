import { Request, Response } from "express";
import { CreateServiceUseCase } from "./use-case-create-service";
import { handleErrors } from "../../../errors/error-handler";
import { CreateServiceRequestParams, createServiceSchema } from "../../../zod/services/create-service-params-schema";


class CreateServiceController {
    constructor(private createServiceUseCase: CreateServiceUseCase) { }

    async handle(req: Request, resp: Response) {
        try {
            const body: CreateServiceRequestParams = req.body;
            // Validate the request parms
            createServiceSchema.parse(body);

            // Esperar a execução do caso de uso
            const response = await this.createServiceUseCase.execute(body);
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

export { CreateServiceController };
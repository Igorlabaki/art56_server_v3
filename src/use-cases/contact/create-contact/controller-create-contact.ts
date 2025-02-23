import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { CreateContactUseCase } from "./use-case-create-contact";
import { CreateContactRequestParams, createContactSchema } from "../../../zod/contact/create-contact-params-schema";

class CreateContactController {
  constructor(private createContactUseCase: CreateContactUseCase) {}

  async handle(req: Request, resp: Response) {
    try {
        const body: CreateContactRequestParams = req.body;
        // Validate the request parms
        createContactSchema.parse(body);

        // Esperar a execução do caso de uso
        const response = await this.createContactUseCase.execute(body);
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

export { CreateContactController };

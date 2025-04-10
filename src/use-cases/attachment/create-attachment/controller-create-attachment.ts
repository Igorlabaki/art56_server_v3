import { Request, Response } from "express";
import { CreateAttachmentUseCase } from "./use-case-create-attachment";
import { CreateAttachemntDbSchema,createAttachemntDbSchema } from "../../../zod/attachment/create-attachment-params-schema";
import { handleErrors } from "../../../errors/error-handler";

class CreateAttachmentController {
  constructor(private createAttachmentUseCase: CreateAttachmentUseCase) {}

  async handle(req: Request, resp: Response) {
    try {
        const body: CreateAttachemntDbSchema = req.body;
        // Validate the request parms
        createAttachemntDbSchema.parse(body);

        // Esperar a execução do caso de uso
        const response = await this.createAttachmentUseCase.execute(body);
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

export { CreateAttachmentController };

import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { CreateNotificationUseCase } from "./use-case-create-notification";
import { CreateNotificationRequestParams, createNotificationSchema } from "../../../zod/notification/create-notification-params-schema";

class CreateNotificationController {
  constructor(private createNotificationUseCase: CreateNotificationUseCase) {}

  async handle(req: Request, resp: Response) {
    try {
        const body: CreateNotificationRequestParams = req.body;
        // Validate the request parms
        createNotificationSchema.parse(body);

        // Esperar a execução do caso de uso
        const response = await this.createNotificationUseCase.execute(body);
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

export { CreateNotificationController };

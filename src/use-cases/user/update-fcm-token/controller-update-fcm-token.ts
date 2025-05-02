import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { UpdateFcmTokenUseCase } from "./use-case-update-fcm-token";
import { UpdateFcmTokenRequestParams, updateFcmTokenSchema } from "../../../zod/user/update-fcm-token-params-schema";

class UpdateFcmTokenController {
    constructor(private updateFcmTokenUseCase: UpdateFcmTokenUseCase) { }

    async handle(req: Request, resp: Response) {
        try {
            const body: UpdateFcmTokenRequestParams = req.body;

            // Validar os parâmetros da requisição
            const validatedData = updateFcmTokenSchema.parse(body);

            // Executar o caso de uso
            const response = await this.updateFcmTokenUseCase.execute(validatedData);

            // Retornar a resposta
            return resp.json(response);

        } catch (error) {
            // Tratar os erros
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdateFcmTokenController }; 
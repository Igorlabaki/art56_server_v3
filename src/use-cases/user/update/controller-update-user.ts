import { Request, Response } from "express"
import { UpdateUserCase } from "./use-case-update-user"
import { handleErrors } from "../../../errors/error-handler";
import { UpdateUserRequestParams, updateUserSchema } from "../../../zod/user/update-user-params-schema";

class UpdateUserController {
    constructor(private updateUseCase: UpdateUserCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const body: UpdateUserRequestParams = req.body

            updateUserSchema.parse(body);

            // Esperar a execução do caso de uso
            const response = await this.updateUseCase.execute(body);
            // Retornar o token
            return resp.json(response);

        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdateUserController }



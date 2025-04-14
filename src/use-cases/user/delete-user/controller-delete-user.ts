import { Request, Response } from "express"

import { handleErrors } from "../../../errors/error-handler";
import { deleteUserRequestParamSchema } from "../../../zod/user/delete-user-param-schema";
import { DeleteUserUseCase } from "./use-case-delete-user";


class DeleteUserController {
    constructor(private deleteUserUseCase: DeleteUserUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = deleteUserRequestParamSchema.parse(req.params);
            const userById = await this.deleteUserUseCase.execute(param.userId);
            
            return resp.json(userById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { DeleteUserController }

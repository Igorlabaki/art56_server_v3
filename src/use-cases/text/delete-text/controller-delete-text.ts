import { Request, Response } from "express"
import { DeleteTextUseCase } from "./use-case-delete-text";
import { handleErrors } from "../../../errors/error-handler";
import { deleteTextRequestParamSchema } from "../../../zod/text/delete-text-param-schema";


class DeleteTextController {
    constructor(private deleteTextUseCase: DeleteTextUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = deleteTextRequestParamSchema.parse(req.params);
            const textById = await this.deleteTextUseCase.execute(param);
            
            return resp.json(textById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { DeleteTextController }

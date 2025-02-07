import { Request, Response } from "express"
import { UpdateTextUseCase } from "./use-case-update-text";
import { handleErrors } from "../../../errors/error-handler";
import { updateTextSchema } from "../../../zod/text/update-text-params-schema";

class UpdateTextController {
    constructor(private updateTextUseCase: UpdateTextUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = updateTextSchema.parse(req.body);

            const textById = await this.updateTextUseCase.execute(param);
            
            return resp.json(textById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdateTextController }

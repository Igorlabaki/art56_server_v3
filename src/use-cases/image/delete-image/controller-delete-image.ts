import { Request, Response } from "express"
import { DeleteImageUseCase } from "./use-case-delete-image";
import { handleErrors } from "../../../errors/error-handler";

class DeleteImageController {
    constructor(private deleteImageUseCase: DeleteImageUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const { imageId } = req.params
            const imageById = await this.deleteImageUseCase.execute(imageId);
            
            return resp.json(imageById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { DeleteImageController }

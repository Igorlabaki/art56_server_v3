import { Request, Response } from "express"
import { UpdateAttachmentUseCase } from "./use-case-update-attachment";
import { handleErrors } from "../../../errors/error-handler";
import { updateAttachmentSchema } from "../../../zod/attachment/update-attachment-params-schema";

class UpdateAttachmentController {
    constructor(private updateAttachmentUseCase: UpdateAttachmentUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = updateAttachmentSchema.parse(req.body);

            const attachmentById = await this.updateAttachmentUseCase.execute(param);
            
            return resp.json(attachmentById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdateAttachmentController }

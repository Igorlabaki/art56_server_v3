import { Request, Response } from "express"
import { DeleteAttachmentUseCase } from "./use-case-delete-attachment";
import { handleErrors } from "../../../errors/error-handler";
import { deleteAttachmentRequestParamSchema } from "../../../zod/attachment/delete-attachment-param-schema";


class DeleteAttachmentController {
    constructor(private deleteAttachmentUseCase: DeleteAttachmentUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = deleteAttachmentRequestParamSchema.parse(req.params);
            const attachmentById = await this.deleteAttachmentUseCase.execute(param);
            
            return resp.json(attachmentById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { DeleteAttachmentController }

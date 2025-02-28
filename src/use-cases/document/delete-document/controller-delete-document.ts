import { Request, Response } from "express"
import { handleErrors } from "../../../errors/error-handler";
import { DeleteDocumentUseCase } from "./use-case-delete-document";
import { deleteDocumentRequestParamSchema } from "../../../zod/document/delete-document-param-schema";


class DeleteDocumentController {
    constructor(private deleteDocumentUseCase: DeleteDocumentUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = deleteDocumentRequestParamSchema.parse(req.params);
            const documentById = await this.deleteDocumentUseCase.execute(param);
            
            return resp.json(documentById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { DeleteDocumentController }

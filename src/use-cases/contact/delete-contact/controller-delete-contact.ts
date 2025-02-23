import { Request, Response } from "express"
import { handleErrors } from "../../../errors/error-handler";
import { DeleteContactUseCase } from "./use-case-delete-contact";
import { deleteContactRequestParamSchema } from "../../../zod/contact/delete-contact-param-schema";


class DeleteContactController {
    constructor(private deleteContactUseCase: DeleteContactUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = deleteContactRequestParamSchema.parse(req.params);
            const contactById = await this.deleteContactUseCase.execute(param);
            
            return resp.json(contactById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { DeleteContactController }

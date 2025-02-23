import { Request, Response } from "express"
import { handleErrors } from "../../../errors/error-handler";
import { UpdateContactUseCase } from "./use-case-update-contact";
import { updateContactSchema } from "../../../zod/contact/update-contact-params-schema";

class UpdateContactController {
    constructor(private updateContactUseCase: UpdateContactUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = updateContactSchema.parse(req.body);

            const contactById = await this.updateContactUseCase.execute(param);
            
            return resp.json(contactById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdateContactController }

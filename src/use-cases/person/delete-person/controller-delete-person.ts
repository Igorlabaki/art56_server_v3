import { Request, Response } from "express"
import { handleErrors } from "../../../errors/error-handler";
import { DeletePersonUseCase } from "./use-case-delete-person";
import { deletePersonRequestParamSchema } from "../../../zod/person/delete-person-param-schema";

class DeletePersonController {
    constructor(private deletePersonUseCase: DeletePersonUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = deletePersonRequestParamSchema.parse(req.params);
            const personById = await this.deletePersonUseCase.execute(param);
            
            return resp.json(personById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { DeletePersonController }

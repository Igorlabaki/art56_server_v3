import { Request, Response } from "express"
import { UpdatePersonUseCase } from "./use-case-update-person";
import { handleErrors } from "../../../errors/error-handler";
import { updatePersonSchema } from "../../../zod/person/update-person-params-schema";

class UpdatePersonController {
    constructor(private updatePersonUseCase: UpdatePersonUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = updatePersonSchema.parse(req.body);

            const personById = await this.updatePersonUseCase.execute(param);
            
            return resp.json(personById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdatePersonController }

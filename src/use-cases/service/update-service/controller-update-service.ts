import { Request, Response } from "express"
import { handleErrors } from "../../../errors/error-handler";
import { UpdateServiceUseCase } from "./use-case-update-service";
import { updateServiceSchema } from "../../../zod/services/update-service-params-schema";

class UpdateServiceController {
    constructor(private updateServiceUseCase: UpdateServiceUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = updateServiceSchema.parse(req.body);

            const serviceById = await this.updateServiceUseCase.execute(param);
            
            return resp.json(serviceById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdateServiceController }

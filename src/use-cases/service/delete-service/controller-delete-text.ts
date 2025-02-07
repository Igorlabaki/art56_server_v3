import { Request, Response } from "express"
import { handleErrors } from "../../../errors/error-handler";
import { DeleteServiceUseCase } from "./use-case-delete-service";
import { deleteServiceRequestParamSchema } from "../../../zod/services/delete-service-param-schema";

class DeleteServiceController {
    constructor(private deleteServiceUseCase: DeleteServiceUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = deleteServiceRequestParamSchema.parse(req.params);

            const serviceById = await this.deleteServiceUseCase.execute(param);
   
            return resp.json(serviceById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { DeleteServiceController }

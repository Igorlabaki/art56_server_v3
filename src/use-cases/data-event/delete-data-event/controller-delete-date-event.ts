import { Request, Response } from "express"

import { handleErrors } from "../../../errors/error-handler";
import { DeleteDateEventUseCase } from "./use-case-delete-data-event";
import { deleteDateEventRequestParamSchema } from "../../../zod/dataEvent/delete-date-event-param-schema";



class DeleteDateEventController {
    constructor(private deleteDateEventUseCase: DeleteDateEventUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = deleteDateEventRequestParamSchema.parse(req.params);
            const dateEventById = await this.deleteDateEventUseCase.execute(param.dateEventId);
            
            return resp.json(dateEventById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { DeleteDateEventController }

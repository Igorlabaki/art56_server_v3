import { Request, Response } from "express"
import { handleErrors } from "../../../errors/error-handler";
import { UpdateSameDayDateEventUseCase } from "./use-case-update-same-day-date-event";
import { updateSameDayDateEventSchema } from "../../../zod/dataEvent/update-same-day-date-event-params-schema";

class UpdateSameDayDateEventController {
    constructor(private updateSameDayDateEventUseCase: UpdateSameDayDateEventUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = updateSameDayDateEventSchema.parse(req.body);
            
            const updateDateEvent = await this.updateSameDayDateEventUseCase.execute(param);
            
            return resp.json(updateDateEvent)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdateSameDayDateEventController }

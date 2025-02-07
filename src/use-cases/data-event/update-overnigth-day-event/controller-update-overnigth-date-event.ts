import { Request, Response } from "express"
import { handleErrors } from "../../../errors/error-handler";
import { UpdateOvernigthDateEventUseCase } from "./use-case-update-overnigth-date-event";
import { updateOverNigthDateEventSchema } from "../../../zod/dataEvent/update-overnigth-date-event-params-schema";

class UpdateOverNigthDateEventController {
    constructor(private updateOverNigthDateEventUseCase: UpdateOvernigthDateEventUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = updateOverNigthDateEventSchema.parse(req.body);
            
            const updateDateEvent = await this.updateOverNigthDateEventUseCase.execute(param);
            
            return resp.json(updateDateEvent)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdateOverNigthDateEventController }

import { Request, Response } from "express"
import { handleErrors } from "../../../errors/error-handler";
import { UpdateScheduleUseCase } from "./use-case-update-schedule";
import { updateScheduleSchema } from "../../../zod/schedule/update-schedule-params-schema";

class UpdateScheduleController {
    constructor(private updateScheduleUseCase: UpdateScheduleUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = updateScheduleSchema.parse(req.body);

            const scheduleById = await this.updateScheduleUseCase.execute(param);
            return resp.json(scheduleById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { UpdateScheduleController }

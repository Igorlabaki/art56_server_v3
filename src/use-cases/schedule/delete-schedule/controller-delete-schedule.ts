import { Request, Response } from "express"
import { handleErrors } from "../../../errors/error-handler";
import { DeleteScheduleUseCase } from "./use-case-delete-schedule";
import { deleteScheduleRequestParamSchema } from "../../../zod/schedule/delete-schedule-param-schema";

class DeleteScheduleController {
    constructor(private deleteScheduleUseCase: DeleteScheduleUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = deleteScheduleRequestParamSchema.parse(req.params);
            const scheduleById = await this.deleteScheduleUseCase.execute(param);
            
            return resp.json(scheduleById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { DeleteScheduleController }

import { Request, Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { GetByIdScheduleUseCase } from "./use-case-get-by-id-schedule";
import { getbyidScheduleRequestParamSchema } from "../../../zod/schedule/get-by-id-schedule-param-schema";


class GetByIdScheduleController {
    constructor(private getbyidScheduleUseCase: GetByIdScheduleUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = getbyidScheduleRequestParamSchema.parse(req.params);
            const scheduleById = await this.getbyidScheduleUseCase.execute(param);
            
            return resp.json(scheduleById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { GetByIdScheduleController }

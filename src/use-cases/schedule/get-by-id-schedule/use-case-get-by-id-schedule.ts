
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { GetByIdScheduleRequestParamSchema } from "../../../zod/schedule/get-by-id-schedule-param-schema";
import { ScheduleRepositoryInterface } from "../../../repositories/interface/schedule-repository-interface";

class GetByIdScheduleUseCase {
    constructor(private scheduleRepository: ScheduleRepositoryInterface) { }

    async execute({ scheduleId }: GetByIdScheduleRequestParamSchema) {

        // Validate if schedule exists
        const schedule = await this.scheduleRepository.getById(scheduleId)

        if (!schedule) {
            throw new HttpResourceNotFoundError("Programacao")
        }
        //

        const getbyiddSchedule = await this.scheduleRepository.getById(scheduleId)

        const formatedResponse = {
            success: true,
            message: `Programacao encontrada com sucesso`,
            data: {
                ...getbyiddSchedule
            },
            count: 1,
            type: "Schedule"
        }

        return formatedResponse
    }
}

export { GetByIdScheduleUseCase }

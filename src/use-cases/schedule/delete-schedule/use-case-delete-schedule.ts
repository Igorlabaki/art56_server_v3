
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { DeleteScheduleRequestParamSchema } from "../../../zod/schedule/delete-schedule-param-schema";
import { ScheduleRepositoryInterface } from "../../../repositories/interface/schedule-repository-interface";

class DeleteScheduleUseCase {
    constructor(private scheduleRepository: ScheduleRepositoryInterface) { }

    async execute({ scheduleId }: DeleteScheduleRequestParamSchema) {

        // Validate if schedule exists
        const schedule = await this.scheduleRepository.getById(scheduleId)

        if (!schedule) {
            throw new HttpResourceNotFoundError("Programacao")
        }
        //

        const deletedSchedule = await this.scheduleRepository.delete(scheduleId)

        const formatedResponse = {
            success: true,
            message: `Convidado removido com sucesso`,
            data: {
                ...deletedSchedule
            },
            count: 1,
            type: "Schedule"
        }

        return formatedResponse
    }
}

export { DeleteScheduleUseCase }

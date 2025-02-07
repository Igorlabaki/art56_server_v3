import { transformDate } from "../../../functions/transform-date";
import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { UpdateScheduleRequestParams } from "../../../zod/schedule/update-schedule-params-schema";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { ScheduleRepositoryInterface } from "../../../repositories/interface/schedule-repository-interface";
import { ProposalRepositoryInterface } from "../../../repositories/interface/proposal-repository-interface";

class UpdateScheduleUseCase {
    constructor(
        private scheduleRepository: ScheduleRepositoryInterface,
        private proposalRepository: ProposalRepositoryInterface,
    ) { }

    async execute(param: UpdateScheduleRequestParams) {
        const { scheduleId, data } = param
        const { endHour, startHour, ...rest } = data
        // Validate if schedule exists
        const schedule = await this.scheduleRepository.getById(scheduleId)

        if (!schedule) {
            throw new HttpResourceNotFoundError("Programacao")
        }
        //

        // Validate if schedule exists
        const proposal = await this.proposalRepository.getById(schedule.proposalId)

        if (!proposal) {
            throw new HttpResourceNotFoundError("Orcamento")
        }
        //

        const { startDate, endDate } = transformDate({ date: proposal.startDate.toLocaleDateString('pt-BR'), endHour: endHour, startHour: startHour, divisor: "/" })

        const updatedSchedule = await this.scheduleRepository.update({
            scheduleId,
            data: {
                ...rest,
                endHour: endDate,
                startHour: startDate
            }
        })

        if (!updatedSchedule) {
            throw new HttpConflictError("Programacao")
        }

        const formatedResponse = {
            success: true,
            message: `Programacao atualizada com sucesso`,
            data: {
                ...updatedSchedule
            },
            count: 1,
            type: "Schedule"
        }

        return formatedResponse
    }
}

export { UpdateScheduleUseCase }

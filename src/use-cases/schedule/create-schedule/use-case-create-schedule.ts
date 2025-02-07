import { transformDate } from "../../../functions/transform-date";
import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error";
import { CreateScheduleRequestParams } from "../../../zod/schedule/create-schedule-params-schema";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { ScheduleRepositoryInterface } from "../../../repositories/interface/schedule-repository-interface";
import { ProposalRepositoryInterface } from "../../../repositories/interface/proposal-repository-interface";

class CreateScheduleUseCase {
  constructor(
    private scheduleRepository: ScheduleRepositoryInterface,
    private proposalRepository: ProposalRepositoryInterface,
  ) {}

  async execute(params: CreateScheduleRequestParams) {
    const { endHour,startHour,...rest} = params
    const proposal = await this.proposalRepository.getById(params.proposalId);

    if(!proposal){
      throw new HttpResourceNotFoundError("Orcamento")
    }

    const { startDate, endDate } = transformDate({ date: proposal.startDate.toLocaleDateString('pt-BR'), endHour: params.endHour, startHour: params.startHour, divisor: "/" })

    const newSchedule = await this.scheduleRepository.create({
      ...rest,
      endHour: endDate,
      startHour: startDate,
    });

    if(!newSchedule){
      throw new HttpBadRequestError("Programacao")
    }

    const formatedResponse = {
      success: true,
      message: "Programacao foi criada com sucesso",
      data: {
         ...newSchedule
      },
      count: 1,
      type: "Schedule"
  } 

  return formatedResponse
  }
}

export { CreateScheduleUseCase };

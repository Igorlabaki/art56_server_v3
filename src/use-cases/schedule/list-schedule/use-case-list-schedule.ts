import { ListScheduleRequestQuerySchema } from "../../../zod/schedule/list-schedule-query-schema";
import { ScheduleRepositoryInterface } from "../../../repositories/interface/schedule-repository-interface";

class ListSchedulesUseCase {
  constructor(private scheduleRepository: ScheduleRepositoryInterface) { }

  async execute(query: ListScheduleRequestQuerySchema) {
    const scheduleList = await this.scheduleRepository.list(query);

    const formatedResponse = {
      success: true,
      message: `Lista de convidados com ${scheduleList?.length} items`,
      data: {
        scheduleList: scheduleList
      },
      count: scheduleList?.length,
      type: "List"
    }

    return formatedResponse;
  }
}

export { ListSchedulesUseCase };

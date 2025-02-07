import { ListDateEventRequestQuerySchema } from "../../../zod/dataEvent/list-date-event-query-schema";
import { DateEventRepositoryInterface } from "../../../repositories/interface/data-event-repository-interface";

class ListDateEventsUseCase {
  constructor(private dateeventRepository: DateEventRepositoryInterface) { }

  async execute(query: ListDateEventRequestQuerySchema) {
    const dateeventList = await this.dateeventRepository.list(query);

    const formatedResponse = {
      success: true,
      message: `Lista de datas com ${dateeventList?.length} items`,
      data: {
        dateEventList: dateeventList
      },
      count: dateeventList?.length,
      type: "List"
    }

    return formatedResponse;
  }
}

export { ListDateEventsUseCase };

import { SeasonalFeeRepositoryInterface } from "../../../repositories/interface/seasonal-fee-repository-interface";
import { ListSeasonalFeeRequestQuerySchema } from "../../../zod/seasonalFee/list-seasonal-fee-query-schema";


class ListSeasonalFeesUseCase {
  constructor(private seasonalfeeRepository: SeasonalFeeRepositoryInterface) { }

  async execute(query: ListSeasonalFeeRequestQuerySchema) {
    const seasonalfeeList = await this.seasonalfeeRepository.list(query);

    const formatedResponse = {
      success: true,
      message: `Lista de adicionais com ${seasonalfeeList?.length} items`,
      data: {
        seasonalfeeList: seasonalfeeList
      },
      count: seasonalfeeList?.length,
      type: "List"
    }

    return formatedResponse;
  }
}

export { ListSeasonalFeesUseCase };

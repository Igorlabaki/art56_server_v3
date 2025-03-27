import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { SeasonalFeeRepositoryInterface } from "../../../repositories/interface/seasonal-fee-repository-interface";
import { CreateSeasonalFeeRequestParams } from "../../../zod/seasonalFee/create-seasonal-fee-params-schema";


class CreateSeasonalFeeUseCase {
  constructor(private seasonalfeeRepository: SeasonalFeeRepositoryInterface) {}

  async execute(params: CreateSeasonalFeeRequestParams) {

    const seasonalfeeAlreadyExists = await this.seasonalfeeRepository.getByTitle({
      venueId: params.venueId,
      title: params.title,
    });

    if(seasonalfeeAlreadyExists){
      throw new HttpConflictError("Ja existe um adicional de temporada com esse nome.")
    }

    const newSeasonalFee = await this.seasonalfeeRepository.create(params);

    const formatedResponse = {
      success: true,
      message: "Adicional de temporada foi cadastrado com sucesso",
      data: {
         ...newSeasonalFee
      },
      count: 1,
      type: "SeasonalFee"
  } 

  return formatedResponse
  }
}

export { CreateSeasonalFeeUseCase };

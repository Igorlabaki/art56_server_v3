
import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error"
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"
import { SeasonalFeeRepositoryInterface } from "../../../repositories/interface/seasonal-fee-repository-interface";
import { UpdateSeasonalFeeRequestParams } from "../../../zod/seasonalFee/update-seasonal-fee-params-schema";

class UpdateSeasonalFeeUseCase {
    constructor(private seasonalfeeRepository: SeasonalFeeRepositoryInterface) { }

    async execute(param: UpdateSeasonalFeeRequestParams) {

        // Validate if seasonalfee exists
        const seasonalfee = await this.seasonalfeeRepository.getById(param.seasonalFeeId)

        if (!seasonalfee) {
            throw new HttpResourceNotFoundError("Pergunta")
        }
        //

        const seasonalfeeAlreadyExists = await this.seasonalfeeRepository.getByTitle({
            venueId: param.venueId,
            title: param.data.title,
            seasonalFeeId: param.seasonalFeeId
        });

        if (seasonalfeeAlreadyExists) {
            throw new HttpConflictError("Ja existe um adicional com este titulo.")
        }

        const updatedSeasonalFee = await this.seasonalfeeRepository.update(param)

        if (!updatedSeasonalFee) {
            throw new HttpConflictError("Pergunta")
        }

        const formatedResponse = {
            success: true,
            message: `Adicional atualizado(a) com sucesso`,
            data: {
                ...updatedSeasonalFee
            },
            count: 1,
            type: "SeasonalFee"
        }

        return formatedResponse
    }
}

export { UpdateSeasonalFeeUseCase }

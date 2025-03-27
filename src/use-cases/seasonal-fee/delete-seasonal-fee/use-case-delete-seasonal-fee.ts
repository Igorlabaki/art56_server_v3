

import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"
import { SeasonalFeeRepositoryInterface } from "../../../repositories/interface/seasonal-fee-repository-interface"
import { DeleteSeasonalFeeRequestParamSchema } from "../../../zod/seasonalFee/delete-seasonal-fee-param-schema"

class DeleteSeasonalFeeUseCase {
    constructor(private seasonalfeeRepository: SeasonalFeeRepositoryInterface) { }

    async execute({ seasonalFeeId }: DeleteSeasonalFeeRequestParamSchema) {

        // Validate if seasonalfee exists
        const seasonalfee = await this.seasonalfeeRepository.getById(seasonalFeeId)

        if (!seasonalfee) {
            throw new HttpResourceNotFoundError("Adicional")
        }
        //

        const deletedSeasonalFee = await this.seasonalfeeRepository.delete(seasonalFeeId)

        const formatedResponse = {
            success: true,
            message: `Adicional deletado com sucesso`,
            data: {
                ...deletedSeasonalFee
            },
            count: 1,
            type: "SeasonalFee"
        }

        return formatedResponse
    }
}

export { DeleteSeasonalFeeUseCase }

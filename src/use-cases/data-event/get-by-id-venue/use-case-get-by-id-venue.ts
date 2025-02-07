import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"

import { VenueRepositoryInterface } from "../../../repositories/interface/venue-repository-interface"
import { GetVenueByIdRequestParamSchema } from "../../../zod/venue/get-by-id-venue-param-schema"

class GetVenueByIdUseCase {
    constructor(private venueRepository: VenueRepositoryInterface) { }

    async execute({venueId}: GetVenueByIdRequestParamSchema) {

        // Validate if venue exists
        const venue = await this.venueRepository.getById({venueId})

        if (!venue) {
            throw new HttpResourceNotFoundError("Locacao")
        }
        //

        const formatedResponse = {
            success: true,
            message: `Locacao  ${venue.name}`,
            data: {
                venue
            },
            count: 1,
            type: "Locacao"
        }

        return formatedResponse
    }
}

export { GetVenueByIdUseCase }

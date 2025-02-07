import { DeleteVenueRequestParamSchema } from "../../../zod/venue/delete-venue-param-schema"
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"
import { VenueRepositoryInterface } from "../../../repositories/interface/venue-repository-interface"

class DeleteVenueUseCase {
    constructor(private venueRepository: VenueRepositoryInterface) { }

    async execute(param: DeleteVenueRequestParamSchema) {

        // Validate if venue exists
        const venue = await this.venueRepository.getById(param)

        if (!venue) {
            throw new HttpResourceNotFoundError("Locacao")
        }
        //

        const deletedVenue = await this.venueRepository.delete(param.venueId)

        const formatedResponse = {
            success: true,
            message: `Locacao  ${venue.name} deletada com sucesso`,
            data: {
                ...deletedVenue
            },
            count: 1,
            type: "Venue"
        }

        return formatedResponse
    }
}

export { DeleteVenueUseCase }

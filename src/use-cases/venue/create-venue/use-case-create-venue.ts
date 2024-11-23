import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error"
import { CreateVenueRequestParams } from "../../../zod/venue/create-venue-params-schema"
import { VenueRepositoryInterface } from "../../../repositories/interface/venue-repository-interface"

class CreateVenueUseCase {
    constructor(
        private venueRepository: VenueRepositoryInterface,
    ) { }

    async execute(params: CreateVenueRequestParams) {

        // Validate if user exists
        const venueAlreadyExists = await this.venueRepository.create(params)

        if (!venueAlreadyExists) {
            throw new HttpConflictError("Venue")
        }
        //

        return { venueAlreadyExists }
    }
}

export { CreateVenueUseCase }
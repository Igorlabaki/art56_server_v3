import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error"
import { CreateVenueDbSchema } from "../../../zod/venue/create-venue-db-schema"
import { VenueRepositoryInterface } from "../../../repositories/interface/venue-repository-interface"

class CreateVenueUseCase {
    constructor(
        private venueRepository: VenueRepositoryInterface,
    ) { }

    async execute(params: CreateVenueDbSchema) {


        const newVenue = await this.venueRepository.create(params)

        if (!newVenue) {
            throw new HttpConflictError("Venue")
        }
        //

        const formatedResponse = {
            success: true,
            message: "Locacao foi criada com sucesso",
            data: {
                ...newVenue
            },
            count: 1,
            type: "Venue"
        } 

        return formatedResponse
    }
}

export { CreateVenueUseCase }
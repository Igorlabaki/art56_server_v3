import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"
import { VenueRepositoryInterface } from "../../../repositories/interface/venue-repository-interface"
import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error"
import { UpdateVenueSchemaDb } from "../../../zod/venue/update-venue-params-schema"
import { UpdateVenueInfoSchemaDb } from "../../../zod/venue/update-info-venue-params-schema"


class UpdateInfoVenueUseCase {
    constructor(private venueRepository: VenueRepositoryInterface) { }

    async execute(param: UpdateVenueInfoSchemaDb) {
        // Validate if venue exists
        const venue = await this.venueRepository.getById({venueId: param.venueId})

        if (!venue) {
            throw new HttpResourceNotFoundError("Locacao")
        }
        //

        const updatedVenue = await this.venueRepository.updateInfo(param)
        if (!updatedVenue) {
            throw new HttpConflictError("Locacao")
        }

        const formattedVenue = {
            ...updatedVenue,
            // @ts-ignore🔥 Junta em uma única string separada por vírgula
          };

        const formatedResponse = {
            success: true,
            message: `Locacao  ${updatedVenue.name} atualizado(a) com sucesso`,
            data: {
                ...formattedVenue
            },
            count: 1,
            type: "Venue"
        }

        return formatedResponse
    }
}

export { UpdateInfoVenueUseCase }

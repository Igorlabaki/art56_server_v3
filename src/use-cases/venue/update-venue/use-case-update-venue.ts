import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"
import { UpdateVenueSchema } from "../../../zod/venue/update-venue-params-schema"
import { VenueRepositoryInterface } from "../../../repositories/interface/venue-repository-interface"
import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error"

class UpdateVenueUseCase {
    constructor(private venueRepository: VenueRepositoryInterface) { }

    async execute(param: UpdateVenueSchema) {
        // Validate if venue exists
        const venue = await this.venueRepository.getById({venueId: param.venueId})
        console.log(param)
        if (!venue) {
            throw new HttpResourceNotFoundError("Locacao")
        }
        //

        const updatedVenue = await this.venueRepository.update(param)

        if (!updatedVenue) {
            throw new HttpConflictError("Locacao")
        }

        const formattedVenue = {
            ...updatedVenue,
            // @ts-ignore
            permissions: venue.UserPermission
              .map((up: { permissions: string }) => up.permissions) // 🔥 Extrai permissões
              .join(",").split(",") // 🔥 Junta em uma única string separada por vírgula
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

export { UpdateVenueUseCase }

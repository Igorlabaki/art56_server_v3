import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"
import { VenueRepositoryInterface } from "../../../repositories/interface/venue-repository-interface"
import { GetSelectedVenueRequestParamSchema } from "../../../zod/venue/get-selected-venue-param-schema"

class GetVenueByIdUseCase {
    constructor(private venueRepository: VenueRepositoryInterface) { }

    async execute({venueId, userId}: GetSelectedVenueRequestParamSchema) {
        // Buscar o local (venue)
        const venue = await this.venueRepository.getSelectedVenue({venueId, userId});

        if (!venue) {
            throw new HttpResourceNotFoundError("Locacao");
        }

        // Juntar todas as permissões em uma única lista
        
        const formattedVenue = {
            ...venue,
            // @ts-ignore
            permissions: venue.UserVenuePermission
              .map((up: { permissions: string }) => up.permissions) // 🔥 Extrai permissões
              .join(",").split(",") // 🔥 Junta em uma única string separada por vírgula
          };

        // Criar a resposta formatada
        const formattedResponse = {
            success: true,
            message: `Locacao ${venue.name}`,
            data: {
                ...formattedVenue
            },
            count: 1,
            type: "Locacao"
        };

        return formattedResponse;
    }
}

export { GetVenueByIdUseCase }

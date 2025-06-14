import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { VenueRepositoryInterface } from "../../../repositories/interface/venue-repository-interface";
import { GetSelectedVenueRequestParamSchema } from "../../../zod/venue/get-selected-venue-param-schema";

class GetWebDataUseCase {
    constructor(private venueRepository: VenueRepositoryInterface) { }

    async execute({venueId, userId}: GetSelectedVenueRequestParamSchema) {
        // Buscar o local (venue)
        const venue = await this.venueRepository.getWebData({venueId, userId});

        if (!venue) {
            throw new HttpResourceNotFoundError("Locacao");
        }


        // Criar a resposta formatada
        const formattedResponse = {
            success: true,
            message: `Locacao ${venue.name}`,
            data: {
                ...venue
            },
            count: 1,
            type: "Locacao"
        };

        return formattedResponse;
    }
}

export { GetWebDataUseCase }

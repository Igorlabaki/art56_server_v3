import { HttpResourceNotFoundError } from "../../errors/errors-type/http-resource-not-found-error";
import { VenueRepositoryInterface } from "../../repositories/interface/venue-repository-interface";
import { GetSelectedVenueRequestParamSchema } from "../../zod/venue/get-selected-venue-param-schema";


class GetWebDataUseCase {
    constructor(private venueRepository: VenueRepositoryInterface) { }

    async execute({venueId, userId}: GetSelectedVenueRequestParamSchema) {
        // Buscar o local (venue)
        const venue = await this.venueRepository.getWebData({venueId, userId});

        if (!venue) {
            throw new HttpResourceNotFoundError("Locacao");
        }

        // Juntar todas as permissões em uma única lista
        
        const formattedVenue = {
            id: venue.id,
            name: venue.name,
            facebookUrl: venue.facebookUrl,
            instagramUrl: venue.instagramUrl,
            tiktokUrl: venue.tiktokUrl,
            whatsappNumber: venue.whatsappNumber,
            images: venue.images,
            minimumNights: venue.minimumNights,
            logoUrl: venue.logoUrl,
            texts: venue.texts,
            questions: venue.questions,
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

export { GetWebDataUseCase }

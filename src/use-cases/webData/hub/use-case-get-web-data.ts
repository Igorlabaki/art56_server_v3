import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { VenueRepositoryInterface } from "../../../repositories/interface/venue-repository-interface";
import { GetHubDataRequestParamSchema } from "../../../zod/venue/get-hub-data-request-param";



class GetHubDataUseCase {
    constructor(private venueRepository: VenueRepositoryInterface) { }

    async execute({organizationId}: GetHubDataRequestParamSchema) {
        // Buscar o local (venue)
        const hubData= await this.venueRepository.getHubData({organizationId});

        if (!hubData) {
            throw new HttpResourceNotFoundError("Locacao");
        }

        const formattedHubData = {
            hubdata: hubData,
            images: hubData.map((venue) => venue.images.map((image) => image.imageUrl))
        }

        // Criar a resposta formatada
        const formattedResponse = {
            success: true,
            message: `Hub data`,
            data: formattedHubData,
            count: 1,
            type: "Locacao"
        };

        return formattedResponse;
    }
}

export { GetHubDataUseCase }

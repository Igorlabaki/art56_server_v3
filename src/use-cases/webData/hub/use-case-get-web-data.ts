import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { OrganizationRepositoryInterface } from "../../../repositories/interface/organization-repository-interface";
import { VenueRepositoryInterface } from "../../../repositories/interface/venue-repository-interface";
import { GetHubDataRequestParamSchema } from "../../../zod/venue/get-hub-data-request-param";



class GetHubDataUseCase {
    constructor(private venueRepository: VenueRepositoryInterface, private organizationRepository: OrganizationRepositoryInterface) { }

    async execute({organizationId}: GetHubDataRequestParamSchema) {
        // Buscar o local (venue)
        const organization = await this.organizationRepository.getById({organizationId});

        if (!organization) {
            throw new HttpResourceNotFoundError("Organizacao");
        }

        const hubData= await this.venueRepository.getHubData({organizationId});

        if (!hubData) {
            throw new HttpResourceNotFoundError("Locacao");
        }

        const imageArrays = hubData.map((venue) => venue.images.map((image) => image.imageUrl));
        const maxLength = Math.max(...imageArrays.map(arr => arr.length));
        const mixedImages = [];
        for (let i = 0; i < maxLength; i++) {
            for (let arr of imageArrays) {
                if (arr[i]) {
                    mixedImages.push(arr[i]);
                }
            }
        }

        const formattedHubData = {
            hubdata: hubData,
            images: mixedImages,
            organization: organization
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

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


        // Criar a resposta formatada
        const formattedResponse = {
            success: true,
            message: `List de Locacoes`,
            data: {
                hubData: [...hubData]
            },
            count: 1,
            type: "Locacao"
        };

        return formattedResponse;
    }
}

export { GetHubDataUseCase }

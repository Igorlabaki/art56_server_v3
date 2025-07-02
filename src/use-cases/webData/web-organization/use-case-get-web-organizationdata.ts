import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { OrganizationRepositoryInterface } from "../../../repositories/interface/organization-repository-interface";
import { VenueRepositoryInterface } from "../../../repositories/interface/venue-repository-interface";
import { GetOrganziationWebDataRequestParamSchema } from "../../../zod/organization/get-web-data-param-schema";
import { GetSelectedVenueRequestParamSchema } from "../../../zod/venue/get-selected-venue-param-schema";

class GetOrganzationWebDataUseCase {
    constructor(private organizationRepository: OrganizationRepositoryInterface) { }

    async execute({organizationId}: GetOrganziationWebDataRequestParamSchema) {
      
        const organization = await this.organizationRepository.getOrganizationWebData({organizationId});

        if (!organization) {
            throw new HttpResourceNotFoundError("Organizacao");
        }


        // Criar a resposta formatada
        const formattedResponse = {
            success: true,
            message: `Organizacao ${organization.name}`,
            data: {
                ...organization
            },
            count: 1,
            type: "Organizacao"
        };

        return formattedResponse;
    }
}

export { GetOrganzationWebDataUseCase }

import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"
import { UpdateOwnerSchema } from "../../../zod/owner/update-owner-params-schema"
import { OwnerRepositoryInterface } from "../../../repositories/interface/owner-repository-interface"
import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error"
import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error"
import { UpdateImageOrganizationRequestSchema } from "../../../zod/organization/update-image-organization-request-schema"
import { OrganizationRepositoryInterface } from "../../../repositories/interface/organization-repository-interface"
import { VenueRepositoryInterface } from "../../../repositories/interface/venue-repository-interface"

class UpdateVenueOrganizationImageUseCase {
    constructor(private organizationRepository: OrganizationRepositoryInterface, private venueRepository: VenueRepositoryInterface) { }

    async execute(param: UpdateImageOrganizationRequestSchema) {

        // Validate if owner exists
        const venue = await this.venueRepository.getById({venueId: param.venueId})

        if (!venue) {
            throw new HttpResourceNotFoundError("Locacao")
        }
        //

        const updatedImageVenueOrganizaiton = await this.organizationRepository.updateImages(param)


        const formatedResponse = {
            success: true,
            message: `Imagens atualizadas com sucesso`,
            data: updatedImageVenueOrganizaiton,
            count: 1,
            type: "Organization"
        }

        return formatedResponse
    }
}

export { UpdateVenueOrganizationImageUseCase }

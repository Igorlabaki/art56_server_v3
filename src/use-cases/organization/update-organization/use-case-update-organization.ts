import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"
import { UpdateOrganizationSchema } from "../../../zod/organization/update-organization-params-schema"
import { OrganizationRepositoryInterface } from "../../../repositories/interface/organization-repository-interface"
import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error"
import { HttpBadRequestError } from "../../../errors/errors-type/htttp-bad-request-error"

class UpdateOrganizationUseCase {
    constructor(private organizationRepository: OrganizationRepositoryInterface) { }

    async execute(param: UpdateOrganizationSchema) {

        // Validate if organization exists
        const organization = await this.organizationRepository.getById({organizationId:param.organizationId})

        if (!organization) {
            throw new HttpResourceNotFoundError("Organizacao")
        }
        //

        const updatedOrganization = await this.organizationRepository.update(param)

        if (!updatedOrganization) {
            throw new HttpConflictError("Organizacao")
        }

        const formatedResponse = {
            success: true,
            message: `Organizacao  ${updatedOrganization.name} atualizada com sucesso`,
            data: {
                organization: updatedOrganization
            },
            count: 1,
            type: "Organization"
        }

        return formatedResponse
    }
}

export { UpdateOrganizationUseCase }

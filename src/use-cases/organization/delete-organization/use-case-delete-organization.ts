import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"
import { DeleteOrganizationSchema } from "../../../zod/organization/delete-organization-params-schema"
import { OrganizationRepositoryInterface } from "../../../repositories/interface/organization-repository-interface"

class DeleteOrganizationUseCase {
    constructor(private organizationRepository: OrganizationRepositoryInterface) { }

    async execute(param: DeleteOrganizationSchema) {

        // Validate if organization exists
        const organization = await this.organizationRepository.getById(param)

        if (!organization) {
            throw new HttpResourceNotFoundError("Organizacao")
        }
        //

        await this.organizationRepository.delete(param)

        const formatedResponse = {
            success: true,
            message: `Organizacao  ${organization.name} deletada com sucesso`,
            data: {},
            count: 1,
            type: "Organization"
        }

        return formatedResponse
    }
}

export { DeleteOrganizationUseCase }

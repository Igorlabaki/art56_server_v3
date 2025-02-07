import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"
import { OrganizationRepositoryInterface } from "../../../repositories/interface/organization-repository-interface"
import { GetByIdOrganizationSchema } from "../../../zod/organization/get-by-id-organization-params-schema"

class GetOrganizationByIdUseCase {
    constructor(private organizationRepository: OrganizationRepositoryInterface) { }

    async execute(param: GetByIdOrganizationSchema) {
        
        // Validate if organization exists
            const organization = await this.organizationRepository.getById(param)

            if (!organization) {
                throw new HttpResourceNotFoundError("Organizacao")
            }
        //

        const formatedResponse = {
            success: true,
            message: `Organizacao ${organization.name} encontrada com sucesso`,
            data: {
                organization
            },
            count: 1,
            type: "Organization"
        }



        return formatedResponse 
    }
}

export { GetOrganizationByIdUseCase }

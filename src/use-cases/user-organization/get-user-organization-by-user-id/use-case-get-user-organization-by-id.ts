import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"
import { OrganizationRepositoryInterface } from "../../../repositories/interface/organization-repository-interface"
import { UserOrganizationRepositoryInterface } from "../../../repositories/interface/user-organization-repository-interface"
import { GetByIdOrganizationSchema } from "../../../zod/organization/get-by-id-organization-params-schema"
import { GetByIdUserOrganizationSchema } from "../../../zod/user-organization/get-by-id-user-organization-params-schema"

class GetUserOrganizationByIdUseCase {
    constructor(private userOrganizationRepository: UserOrganizationRepositoryInterface) { }

    async execute(param: GetByIdUserOrganizationSchema) {
        
        // Validate if organization exists
            const userOrganization = await this.userOrganizationRepository.getById(param.userOrganizationId)

            if (!userOrganization) {
                throw new HttpResourceNotFoundError("Organizacao")
            }
        //

        const formatedResponse = {
            success: true,
            message: `Organizacao do usuario encontrada com sucesso`,
            data: {
                ...userOrganization
            },
            count: 1,
            type: "Organization"
        }



        return formatedResponse 
    }
}

export { GetUserOrganizationByIdUseCase }

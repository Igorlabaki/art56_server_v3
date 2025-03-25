import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"
import { UserOrganizationRepositoryInterface } from "../../../repositories/interface/user-organization-repository-interface"
import { DeleteUserOrganizationRequestParamSchema } from "../../../zod/user-organization/delete-user-organization-param-schema"

class DeleteUserOrganizationUseCase {
    constructor(private userorganizationRepository: UserOrganizationRepositoryInterface) { }

    async execute(param: DeleteUserOrganizationRequestParamSchema) {

        // Validate if userorganization exists
        const userorganization = await this.userorganizationRepository.getById(param.userOrganizationId)

        if (!userorganization) {
            throw new HttpResourceNotFoundError("User")
        }
        //

        const deletedUserOrganization = await this.userorganizationRepository.delete(param.userOrganizationId)

        const formatedResponse = {
            success: true,
            message: `Permissao deletada com sucesso`,
            data: {
                ...deletedUserOrganization
            },
            count: 1,
            type: "UserOrganization"
        }

        return formatedResponse
    }
}

export { DeleteUserOrganizationUseCase }

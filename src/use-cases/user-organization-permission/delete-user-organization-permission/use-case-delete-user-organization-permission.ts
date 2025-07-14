import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"
import { UserOrganizationPermissionRepositoryInterface } from "../../../repositories/interface/user-organization-permission-repository-interface"
import { DeleteUserOrganizationPermissionRequestParamSchema } from "../../../zod/user-organization-permission/delete-user-organization-permission-param-schema"

class DeleteUserOrganizationPermissionUseCase {
    constructor(private userOrganizationPermissionRepository: UserOrganizationPermissionRepositoryInterface) { }

    async execute(param: DeleteUserOrganizationPermissionRequestParamSchema) {

        // Validate if userpermission exists
        const userOrganizationPermission = await this.userOrganizationPermissionRepository.getById(param.userOrganizationPermissionId)

        if (!userOrganizationPermission) {
            throw new HttpResourceNotFoundError("User")
        }
        //

        const deletedUserOrganizationPermission = await this.userOrganizationPermissionRepository.delete(param.userOrganizationPermissionId)

        const formatedResponse = {
            success: true,
            message: `Permissao deletada com sucesso`,
            data: {
                ...deletedUserOrganizationPermission
            },
            count: 1,
            type: "UserPermission"
        }

        return formatedResponse
    }
}

export { DeleteUserOrganizationPermissionUseCase }

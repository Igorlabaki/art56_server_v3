import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"
import { UserOrganizationRepositoryInterface } from "../../../repositories/interface/user-organization-repository-interface"
import { UserPermissionRepositoryInterface } from "../../../repositories/interface/user-permission-repository-interface"
import { DeleteUserPermissionRequestParamSchema } from "../../../zod/user-permission/delete-user-permission-param-schema"

class DeleteUserPermissionUseCase {
    constructor(
        private userpermissionRepository: UserPermissionRepositoryInterface,
        private userOrganizationRepository: UserOrganizationRepositoryInterface,
    ) { }

    async execute(param: DeleteUserPermissionRequestParamSchema) {

        // Validate if userpermission exists
        const userpermission = await this.userpermissionRepository.getById(param.userPermissionId)

        if (!userpermission) {
            throw new HttpResourceNotFoundError("User")
        }
        //

        const deletedUserPermission = await this.userpermissionRepository.delete(param.userPermissionId)

        if (deletedUserPermission) {
            const userOrganization = await this.userOrganizationRepository.getById(deletedUserPermission?.userOrganizationId)

            if (!userOrganization?.userPermissions) {
                await this.userOrganizationRepository.delete(deletedUserPermission?.userOrganizationId)
            }
        }

        const formatedResponse = {
            success: true,
            message: `Permissao deletada com sucesso`,
            data: {
                ...deletedUserPermission
            },
            count: 1,
            type: "UserPermission"
        }

        return formatedResponse
    }
}

export { DeleteUserPermissionUseCase }

import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"
import { UserPermissionRepositoryInterface } from "../../../repositories/interface/user-permission-repository-interface"
import { DeleteUserPermissionRequestParamSchema } from "../../../zod/user-permission/delete-user-permission-param-schema"

class DeleteUserPermissionUseCase {
    constructor(private userpermissionRepository: UserPermissionRepositoryInterface) { }

    async execute(param: DeleteUserPermissionRequestParamSchema) {

        // Validate if userpermission exists
        const userpermission = await this.userpermissionRepository.getById(param.userPermissionId)

        if (!userpermission) {
            throw new HttpResourceNotFoundError("User")
        }
        //

        const deletedUserPermission = await this.userpermissionRepository.delete(param.userPermissionId)

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

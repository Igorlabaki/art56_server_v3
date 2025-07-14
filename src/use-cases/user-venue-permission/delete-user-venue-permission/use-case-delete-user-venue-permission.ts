import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"
import { UserVenuePermissionRepositoryInterface } from "../../../repositories/interface/user-venue-permission-repository-interface"
import { DeleteUserVenuePermissionRequestParamSchema } from "../../../zod/user-venue-permission/delete-user-venue-permission-param-schema"

class DeleteUserVenuePermissionUseCase {
    constructor(private userVenuePermissionRepository: UserVenuePermissionRepositoryInterface) { }

    async execute(param: DeleteUserVenuePermissionRequestParamSchema) {

        // Validate if userpermission exists
        const userVenuePermission = await this.userVenuePermissionRepository.getById(param.userVenuePermissionId)

        if (!userVenuePermission) {
            throw new HttpResourceNotFoundError("User")
        }
        //

        const deletedUserVenuePermission = await this.userVenuePermissionRepository.delete(param.userVenuePermissionId)

        const formatedResponse = {
            success: true,
            message: `Permissao deletada com sucesso`,
            data: {
                ...deletedUserVenuePermission
            },
            count: 1,
            type: "UserPermission"
        }

        return formatedResponse
    }
}

export { DeleteUserVenuePermissionUseCase }

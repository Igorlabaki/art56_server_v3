import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"
import { UserVenuePermissionRepositoryInterface } from "../../../repositories/interface/user-venue-permission-repository-interface"
import { GetUserVenuePermissionSchema } from "../../../zod/user-venue-permission/get-user-venue-permission-params-schema"

class GetUserVenuePermissionUseCase {
    constructor(private userVenuePermissionRepository: UserVenuePermissionRepositoryInterface) { }

    async execute(params: GetUserVenuePermissionSchema) {
        
        // Validate if permission exists
            const userVenuePermission = await this.userVenuePermissionRepository.getUserVenuePermission(params)

            if (!userVenuePermission) {
                throw new HttpResourceNotFoundError("Permissao")
            }
        //

        const formatedResponse = {
            success: true,
            message: `Permissao do usuario encontrada com sucesso`,
            data: {
                ...userVenuePermission
            },
            count: 1,
            type: "Permission"
        }



        return formatedResponse 
    }
}

export { GetUserVenuePermissionUseCase }

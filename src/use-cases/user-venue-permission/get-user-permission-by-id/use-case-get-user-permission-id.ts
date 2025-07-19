import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"
import { UserVenuePermissionRepositoryInterface } from "../../../repositories/interface/user-venue-permission-repository-interface"
import { GetByIdUserVenuePermissionSchema } from "../../../zod/user-venue-permission/get-by-id-user-venue-permission-params-schema"
  

class GetUserVenuePermissionByIdUseCase {
    constructor(private userVenuePermissionRepository: UserVenuePermissionRepositoryInterface) { }

    async execute(param: GetByIdUserVenuePermissionSchema) {
        
        // Validate if permission exists
            const userVenuePermission = await this.userVenuePermissionRepository.getById(param.userVenuePermissionId)

            if (!userVenuePermission) {
                throw new HttpResourceNotFoundError("Organizacao")
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

export { GetUserVenuePermissionByIdUseCase }

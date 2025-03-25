import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"
import { UserPermissionRepositoryInterface } from "../../../repositories/interface/user-permission-repository-interface"
import { GetByIdUserPermissionSchema } from "../../../zod/user-permission/get-by-id-user-permission-params-schema"

class GetUserPermissionByIdUseCase {
    constructor(private userPermissionRepository: UserPermissionRepositoryInterface) { }

    async execute(param: GetByIdUserPermissionSchema) {
        
        // Validate if permission exists
            const userPermission = await this.userPermissionRepository.getById(param.userPermissionId)

            if (!userPermission) {
                throw new HttpResourceNotFoundError("Organizacao")
            }
        //

        const formatedResponse = {
            success: true,
            message: `Permissao do usuario encontrada com sucesso`,
            data: {
                ...userPermission
            },
            count: 1,
            type: "Permission"
        }



        return formatedResponse 
    }
}

export { GetUserPermissionByIdUseCase }

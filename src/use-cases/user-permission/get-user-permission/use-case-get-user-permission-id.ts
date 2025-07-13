import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"
import { UserPermissionRepositoryInterface } from "../../../repositories/interface/user-permission-repository-interface"
import { GetUserPermissionSchema } from "../../../zod/user-permission/get-user-permission-params-schema"

class GetUserPermissionUseCase {
    constructor(private userPermissionRepository: UserPermissionRepositoryInterface) { }

    async execute(params: GetUserPermissionSchema) {
        
        // Validate if permission exists
            const userPermission = await this.userPermissionRepository.getUserPermission(params)

            if (!userPermission) {
                throw new HttpResourceNotFoundError("Organizacao")
            }
        //

        const formatedResponse = {
            success: true,
            message: `Permissao do usuario encontrada com sucesso`,
            data: {
                userPermissionList: [...userPermission]
            },
            count: 1,
            type: "Permission"
        }



        return formatedResponse 
    }
}

export { GetUserPermissionUseCase }

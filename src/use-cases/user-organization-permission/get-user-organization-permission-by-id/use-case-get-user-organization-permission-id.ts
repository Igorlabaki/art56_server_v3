import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"
import { UserOrganizationPermissionRepositoryInterface } from "../../../repositories/interface/user-organization-permission-repository-interface"
import { GetByIdUserOrganizationPermissionSchema } from "../../../zod/user-organization-permission/get-by-id-user-organization-permission-params-schema"
import { GetUserOrganizationPermissionSchema } from "../../../zod/user-organization-permission/get-user-organization-permission-params-schema"

class      GetUserOrganizationPermissionByIdUseCase {
    constructor(private userOrganizationPermissionRepository: UserOrganizationPermissionRepositoryInterface) { }

    async execute(param: GetUserOrganizationPermissionSchema) {
        
        // Validate if permission exists
            const userOrganizationPermission = await this.userOrganizationPermissionRepository.getByUserOrganizationPermission(param)

            if (!userOrganizationPermission) {
                throw new HttpResourceNotFoundError("Organizacao")
            }
        //

        const formatedResponse = {
            success: true,
            message: `Permissao do usuario encontrada com sucesso`,
            data: {
                ...userOrganizationPermission
            },
            count: 1,
            type: "Permission"
        }



        return formatedResponse 
    }
}

export { GetUserOrganizationPermissionByIdUseCase }

import { UserOrganizationPermissionRepositoryInterface } from "../../../repositories/interface/user-organization-permission-repository-interface";
import { HttpInvalidCredentialsError } from "../../../errors/errors-type/http-invalid-credentials-error";
import { ListUserOrganizationPermissionByUserRequestQuerySchema } from "../../../zod/user-organization-permission/list-user-organization-permission-by-query-schema";

  export class ListUserOrganizationPermissionUseCase {
  constructor(
    private userOrganizationPermissionRepository: UserOrganizationPermissionRepositoryInterface,
    private permissionRepository: UserOrganizationPermissionRepositoryInterface
  ) { }

  async execute({ userOrganizationId }: ListUserOrganizationPermissionByUserRequestQuerySchema) {
    // Buscar as organizações e permissões associadas ao usuário
    const userOrganizationPermissionList = await this.userOrganizationPermissionRepository.list({
     userOrganizationId
    });

    if (!userOrganizationPermissionList) {
      throw new HttpInvalidCredentialsError()
    }

    // Retorna a resposta formatada
    const formatedResponse = {
      success: true,
          message: `Lista de permissoes com ${userOrganizationPermissionList.length} items`,
      data: {
        userOrganizationPermissionList
      },
      type: "List",
    };

    return formatedResponse;
  }
}
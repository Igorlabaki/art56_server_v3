import { UserPermissionRepositoryInterface } from "../../../repositories/interface/user-permission-repository-interface";
import { HttpInvalidCredentialsError } from "../../../errors/errors-type/http-invalid-credentials-error";
import { ListUserPermissionByUserRequestQuerySchema } from "../../../zod/user-permission/list-user-permission-by-query-schema";

export class ListUserPermissionUseCase {
  constructor(
    private userPermissionRepository: UserPermissionRepositoryInterface,
    private permissionRepository: UserPermissionRepositoryInterface
  ) { }

  async execute({ userOrganizationId }: ListUserPermissionByUserRequestQuerySchema) {
    // Buscar as organizações e permissões associadas ao usuário
    const userPermissionList = await this.userPermissionRepository.list({
     userOrganizationId
    });

    if (!userPermissionList) {
      throw new HttpInvalidCredentialsError()
    }

    // Retorna a resposta formatada
    const formatedResponse = {
      success: true,
      message: `Lista de permissoes com ${userPermissionList.length} items`,
      data: {
        userPermissionList: userPermissionList,
      },
      count: userPermissionList.length,
      type: "List",
    };

    return formatedResponse;
  }
}
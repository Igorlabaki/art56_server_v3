import { UserVenuePermissionRepositoryInterface } from "../../../repositories/interface/user-venue-permission-repository-interface";
import { HttpInvalidCredentialsError } from "../../../errors/errors-type/http-invalid-credentials-error";
import { ListUserVenuePermissionByUserRequestQuerySchema } from "../../../zod/user-venue-permission/list-user-venue-permission-by-query-schema";

export class ListUserVenuePermissionUseCase {
  constructor(
    private userVenuePermissionRepository: UserVenuePermissionRepositoryInterface,
    private permissionRepository: UserVenuePermissionRepositoryInterface
  ) { }

  async execute({ userOrganizationId }: ListUserVenuePermissionByUserRequestQuerySchema) {
    // Buscar as organizações e permissões associadas ao usuário
    const userVenuePermissionList = await this.userVenuePermissionRepository.list({
     userOrganizationId
    });

    if (!userVenuePermissionList) {
      throw new HttpInvalidCredentialsError()
    }

    // Retorna a resposta formatada
    const formatedResponse = {
      success: true,
      message: `Lista de permissoes com ${userVenuePermissionList.length} items`,
      data: {
        userVenuePermissionList: userVenuePermissionList,
      },
      count: userVenuePermissionList.length,
      type: "List",
    };

    return formatedResponse;
  }
}
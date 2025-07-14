import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { UserVenuePermissionRepositoryInterface } from "../../../repositories/interface/user-venue-permission-repository-interface";
import { UpdateUserVenuePermissionRequestParams } from "../../../zod/user-venue-permission/update-user-venue-permission-params-schema";


class UpdateUserVenuePermissionUseCase {
  constructor(private userVenuePermissionRepository: UserVenuePermissionRepositoryInterface) {}

  async execute(params : UpdateUserVenuePermissionRequestParams) {

    const updateUserVenuePermission = await this.userVenuePermissionRepository.update(params);

    const formatedResponse = {
      success: true,
      message: `Permissao foi atualizado  com sucesso.`,
      data: {
        ...updateUserVenuePermission
      },
      count: 1,
      type: "UserPermission"
  } 

  return formatedResponse
  }
}

export { UpdateUserVenuePermissionUseCase };

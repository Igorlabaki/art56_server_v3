import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { UserPermissionRepositoryInterface } from "../../../repositories/interface/user-permission-repository-interface";
import { UpdateUserPermissionRequestParams } from "../../../zod/user-permission/update-user-permission-params-schema";


class UpdateUserPermissionUseCase {
  constructor(private userpermissionRepository: UserPermissionRepositoryInterface) {}

  async execute(params : UpdateUserPermissionRequestParams) {

    const updateUserPermission = await this.userpermissionRepository.update(params);

    const formatedResponse = {
      success: true,
      message: `Permissao foi atualizado  com sucesso.`,
      data: {
        ...updateUserPermission
      },
      count: 1,
      type: "UserPermission"
  } 

  return formatedResponse
  }
}

export { UpdateUserPermissionUseCase };

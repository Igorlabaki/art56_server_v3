import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { UserOrganizationPermissionRepositoryInterface } from "../../../repositories/interface/user-organization-permission-repository-interface";
import { UpdateUserOrganizationPermissionRequestParams } from "../../../zod/user-organization-permission/update-user-organization-permission-params-schema";


class UpdateUserOrganizationPermissionUseCase {
  constructor(private userOrganizationPermissionRepository: UserOrganizationPermissionRepositoryInterface) {}

  async execute(params : UpdateUserOrganizationPermissionRequestParams) {

    const updateUserOrganizationPermission = await this.userOrganizationPermissionRepository.update(params);

    const formatedResponse = {
      success: true,
      message: `Permissao foi atualizado  com sucesso.`,
      data: {
        ...updateUserOrganizationPermission
      },
      count: 1,
      type: "UserPermission"
  } 

  return formatedResponse
  }
}

  export { UpdateUserOrganizationPermissionUseCase };

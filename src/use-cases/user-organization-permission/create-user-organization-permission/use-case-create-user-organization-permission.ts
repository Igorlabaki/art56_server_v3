import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { UserOrganizationRepositoryInterface } from "../../../repositories/interface/user-organization-repository-interface";
import { UserOrganizationPermissionRepositoryInterface } from "../../../repositories/interface/user-organization-permission-repository-interface";
import { CreateUserOrganizationPermissionRequestParams } from "../../../zod/user-organization-permission/create-user-organization-permission-params-schema";


class CreateUserOrganizationPermissionUseCase {
  constructor(private userOrganizationPermissionRepository: UserOrganizationPermissionRepositoryInterface, private userOrganizationRepository: UserOrganizationRepositoryInterface) { }

  async execute(params: CreateUserOrganizationPermissionRequestParams) {

    const userOrganizationExists = await this.userOrganizationRepository.verifyByUserIdAndOrganizationId({
      organizationId: params.userOrganizationId,
      userId: params.userId,
    })

    if (userOrganizationExists) {
      const userOrganizationPermission = await this.userOrganizationPermissionRepository.create(params);

      const formatedResponse = {
        success: true,
        message: `Usuario foi cadastrado na organizacao com sucesso.`,
        data: {
          ...userOrganizationPermission
        },
        count: 1,
        type: "UserPermission"
      }

      return formatedResponse
    }

    const { userOrganizationId, ...rest } = params
    
    const newUserOrganization = await this.userOrganizationRepository.create({
      organizationId: params.userOrganizationId,
      userId: params.userId,
    })

    if (newUserOrganization) {
      const userOrganizationPermission = await this.userOrganizationPermissionRepository.create({
        ...rest,
        userOrganizationId: newUserOrganization?.id
      });

      const formatedResponse = {
        success: true,
        message: `Usuario foi cadastrado no estabelecimento com sucesso.`,
        data: {
          ...userOrganizationPermission
        },
        count: 1,
        type: "UserOrganizationPermission"
      }

      return formatedResponse
    }


  }
}

export { CreateUserOrganizationPermissionUseCase };

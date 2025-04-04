import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { UserOrganizationRepositoryInterface } from "../../../repositories/interface/user-organization-repository-interface";
import { UserPermissionRepositoryInterface } from "../../../repositories/interface/user-permission-repository-interface";
import { CreateUserPermissionRequestParams } from "../../../zod/user-permission/create-user-permission-params-schema";


class CreateUserPermissionUseCase {
  constructor(private userpermissionRepository: UserPermissionRepositoryInterface, private userOrganizationRepository: UserOrganizationRepositoryInterface) { }

  async execute(params: CreateUserPermissionRequestParams) {

    const userOrganizationExists = await this.userOrganizationRepository.verifyByUserIdAndOrganizationId({
      organizationId: params.organizationId,
      userId: params.userId,
    })

    if (userOrganizationExists) {
      const userPermission = await this.userpermissionRepository.create(params);

      const formatedResponse = {
        success: true,
        message: `Usuario foi cadastrado na organizacao com sucesso.`,
        data: {
          ...userPermission
        },
        count: 1,
        type: "UserPermission"
      }

      return formatedResponse
    }

    const { userorganizationId, ...rest } = params
    
    const newUserOrganization = await this.userOrganizationRepository.create({
      organizationId: params.organizationId,
      userId: params.userId,
    })

    if (newUserOrganization) {
      const userPermission = await this.userpermissionRepository.create({
        ...rest,
        userorganizationId: newUserOrganization?.id
      });

      const formatedResponse = {
        success: true,
        message: `Usuario foi cadastrado na organizacao com sucesso.`,
        data: {
          ...userPermission
        },
        count: 1,
        type: "UserPermission"
      }

      return formatedResponse
    }


  }
}

export { CreateUserPermissionUseCase };

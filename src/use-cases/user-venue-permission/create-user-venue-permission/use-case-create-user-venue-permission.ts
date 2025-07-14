import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { UserOrganizationRepositoryInterface } from "../../../repositories/interface/user-organization-repository-interface";
import { UserVenuePermissionRepositoryInterface } from "../../../repositories/interface/user-venue-permission-repository-interface";
import { CreateUserVenuePermissionRequestParams } from "../../../zod/user-venue-permission/create-user-venue-permission-params-schema";


class CreateUserVenuePermissionUseCase {
  constructor(private userVenuePermissionRepository: UserVenuePermissionRepositoryInterface, private userOrganizationRepository: UserOrganizationRepositoryInterface) { }

  async execute(params: CreateUserVenuePermissionRequestParams) {

    const userOrganizationExists = await this.userOrganizationRepository.verifyByUserIdAndOrganizationId({
      organizationId: params.organizationId,
      userId: params.userId,
    })

    if (userOrganizationExists) {
      const userVenuePermission = await this.userVenuePermissionRepository.create(params);

      const formatedResponse = {
        success: true,
        message: `Usuario foi cadastrado na organizacao com sucesso.`,
        data: {
          ...userVenuePermission
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
      const userVenuePermission = await this.userVenuePermissionRepository.create({
        ...rest,
        userorganizationId: newUserOrganization?.id
      });

      const formatedResponse = {
        success: true,
        message: `Usuario foi cadastrado no estabelecimento com sucesso.`,
        data: {
          ...userVenuePermission
        },
        count: 1,
        type: "UserVenuePermission"
      }

      return formatedResponse
    }


  }
}

export { CreateUserVenuePermissionUseCase };

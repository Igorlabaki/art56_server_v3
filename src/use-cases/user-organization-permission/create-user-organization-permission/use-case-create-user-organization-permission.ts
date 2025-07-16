import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error";
import { UserOrganizationRepositoryInterface } from "../../../repositories/interface/user-organization-repository-interface";
import { UserOrganizationPermissionRepositoryInterface } from "../../../repositories/interface/user-organization-permission-repository-interface";
import { CreateUserOrganizationPermissionRequestParams } from "../../../zod/user-organization-permission/create-user-organization-permission-params-schema";
import { OrganizationRepositoryInterface } from "../../../repositories/interface/organization-repository-interface";
import { UserRepositoryInterface } from "../../../repositories/interface/user-repository-interface";

class CreateUserOrganizationPermissionUseCase {
  constructor(
    private userOrganizationPermissionRepository: UserOrganizationPermissionRepositoryInterface, 
    private userOrganizationRepository: UserOrganizationRepositoryInterface,
    private organizationRepository: OrganizationRepositoryInterface,
    private userRepository: UserRepositoryInterface
  ) { }

  async execute(params: CreateUserOrganizationPermissionRequestParams) {

    // Verificar se o usuário existe
    const user = await this.userRepository.getById(params.userId);
    if (!user) {
      throw new HttpResourceNotFoundError("Usuário");
    }

    // Verificar se a organização existe
    const organization = await this.organizationRepository.getById({ organizationId: params.organizationId });
    if (!organization) {
      throw new HttpResourceNotFoundError("Organização");
    }

    // Se userOrganizationId foi fornecido, verificar se existe e se pertence ao usuário e organização corretos
    if (params.userOrganizationId) {
      const existingUserOrganization = await this.userOrganizationRepository.getById(params.userOrganizationId);

      if (existingUserOrganization && 
          existingUserOrganization.userId === params.userId && 
          existingUserOrganization.organizationId === params.organizationId) {
        
        // Se o UserOrganization já existe e é válido, apenas criar a permissão
        const userOrganizationPermission = await this.userOrganizationPermissionRepository.create({
          permissions: params.permissions,
          role: params.role,
          userOrganizationId: params.userOrganizationId,
          userId: params.userId,
          organizationId: params.organizationId
        });

        const formatedResponse = {
          success: true,
          message: `Permissões do usuário foram criadas com sucesso.`,
          data: {
            ...userOrganizationPermission
          },
          count: 1,
          type: "UserOrganizationPermission"
        }

        return formatedResponse
      }
    }

    // Verificar se existe uma relação entre o usuário e a organização
    const userOrganizationExists = await this.userOrganizationRepository.verifyByUserIdAndOrganizationId({
      organizationId: params.organizationId,
      userId: params.userId,
    })

    if (userOrganizationExists) {
      // Se a relação existe, criar a permissão usando o ID da relação existente
      const userOrganizationPermission = await this.userOrganizationPermissionRepository.create({
        permissions: params.permissions,
        userOrganizationId: userOrganizationExists.id,
        userId: params.userId,
        role: params.role,
        organizationId: params.organizationId
      });

      const formatedResponse = {
        success: true,
        message: `Permissões do usuário foram criadas com sucesso.`,
        data: {
          ...userOrganizationPermission
        },
        count: 1,
        type: "UserOrganizationPermission"
      }

      return formatedResponse
    }

    // Se não existe a relação, criar tanto a relação quanto a permissão
    const newUserOrganization = await this.userOrganizationRepository.create({
      organizationId: params.organizationId,
      userId: params.userId,
    })

    if (newUserOrganization) {
      const userOrganizationPermission = await this.userOrganizationPermissionRepository.create({
        permissions: params.permissions,
        userOrganizationId: newUserOrganization.id,
        userId: params.userId,
        role: params.role,
        organizationId: params.organizationId
      });

      const formatedResponse = {
        success: true,
        message: `Usuário foi cadastrado na organização com sucesso.`,
        data: {
          ...userOrganizationPermission
        },
        count: 1,
        type: "UserOrganizationPermission"
      }

      return formatedResponse
    }

    throw new Error("Não foi possível criar a relação usuário-organização");
  }
}

export { CreateUserOrganizationPermissionUseCase };

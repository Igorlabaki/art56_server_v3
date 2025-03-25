
import { HttpInvalidCredentialsError } from "../../../errors/errors-type/http-invalid-credentials-error";
import { OrganizationRepositoryInterface } from "../../../repositories/interface/organization-repository-interface";
import { UserOrganizationRepositoryInterface } from "../../../repositories/interface/user-organization-repository-interface";
import { ListUserOrganizationByOrganizationRequestQuerySchema } from "../../../zod/user-organization/list-user-organization-by-organization-query-schema";

export class ListUserOrganizationByOrganizationUseCase {
  constructor(
    private userOrganizationRepositoryInterface: UserOrganizationRepositoryInterface,
    private organizationRepository: OrganizationRepositoryInterface
  ) { }

  private transformUserPermissions(userPermissions: any[]) {
    const orgMap = new Map();

    userPermissions.forEach(item => {
      const orgId = item.userOrganization.organizationId;

      if (!orgMap.has(orgId)) {
        orgMap.set(orgId, {
          organizationId: orgId,
          organizationPermissions: [],
          venueIds: [],
          venuePermissions: []
        });
      }

      const orgData = orgMap.get(orgId);

      if (item.venueId) {
        if (!orgData.venueIds.includes(item.venueId)) {
          orgData.venueIds.push(item.venueId);
        }
        orgData.venuePermissions.push({
          venueId: item.venueId,
          permissions: item.permissions.split(',')
        });
      } else {
        item.permissions.split(',').forEach((permission: any) => {
          if (!orgData.organizationPermissions.includes(permission)) {
            orgData.organizationPermissions.push(permission);
          }
        });
      }
    });

    return Array.from(orgMap.values());
  }
  async execute({ organizationId, username }: ListUserOrganizationByOrganizationRequestQuerySchema) {
    // Buscar as organizações e permissões associadas ao usuário
    const userOrganizationByOrganizationList = await this.userOrganizationRepositoryInterface.listByOrganization({
      username,
      organizationId,
    });

    if (!userOrganizationByOrganizationList) {
      throw new HttpInvalidCredentialsError()
    }

    // Retorna a resposta formatada
    const formatedResponse = {
      success: true,
      message: `Lista de organizações com ${userOrganizationByOrganizationList.length} items`,
      data: {
        userOrganizationByOrganizationList: userOrganizationByOrganizationList,
      },
      count: userOrganizationByOrganizationList.length,
      type: "List",
    };

    return formatedResponse;
  }
}
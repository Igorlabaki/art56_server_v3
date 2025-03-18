
import { PrismaClient, UserOrganization } from "@prisma/client"
import { UserOrganizationRepositoryInterface } from "../interface/user-organization-repository-interface"
import { CreateUserOrganizationRequestParams } from "../../zod/user-organization/create-user-organization-params-schema"
import { ListUserOrganizationRequestQuerySchema } from "../../zod/user-organization/list-user-organization-query-schema"



export class PrismaUserOrganizationRepository implements UserOrganizationRepositoryInterface {

  constructor(private readonly prisma: PrismaClient) { }

  async getPermissions(permissionNames: string[], userId: string, venueId: string): Promise<string> {
    // Busca as permissões associadas ao usuário e ao venueId
    const permissions = await this.prisma.userPermission.findMany({
      where: {
        userOrganization: {
          userId, // Filtro pelo ID do usuário
        },
        venueId, // Filtro pelo ID do venue
      },
    });

    // Obtém as permissões atuais (separadas por vírgula) e as divide em uma lista
    const currentPermissions = permissions.flatMap((perm) => perm.permissions.split(','));

    // Adiciona as permissões faltantes
    const missingPermissions = permissionNames.filter(
      (name) => !currentPermissions.includes(name)
    );

    // Remove as permissões que não estão mais na lista `permissionNames`
    const permissionsToRemove = currentPermissions.filter(
      (perm) => !permissionNames.includes(perm)
    );

    // Calcula a lista final de permissões após adicionar as faltantes e remover as desnecessárias
    const finalPermissions = [
      ...new Set([...currentPermissions, ...missingPermissions]) // Remove duplicatas
    ];

    // Remove as permissões que não estão mais na lista `permissionNames`
    const updatedPermissions = finalPermissions.filter(
      (perm) => !permissionsToRemove.includes(perm)
    );

    // Retorna a string com as permissões finais separadas por vírgulas
    return updatedPermissions.join(',');
  }

  async create({
    organizationId,
    userId,
    role,
    venuesPermissions,  // Array de permissões por venue
  }: CreateUserOrganizationRequestParams): Promise<UserOrganization | null> {
    if (!venuesPermissions || venuesPermissions.length === 0) {
      return null;
    }

    // Cria um array de permissões (nome de permissões por venue)
    const permissionsNames = venuesPermissions.flatMap((item) => item.permissions);

    // Verifica as permissões do usuário para cada venue e compara com a lista recebida
    const updatedPermissions = await this.getPermissions(permissionsNames, userId, venuesPermissions[0].venueId);

    // Divide as permissões de volta em uma lista
    const finalPermissions = updatedPermissions.split(',');

    // Cria um único UserOrganization
    const userOrganization = await this.prisma.userOrganization.create({
      data: {
        organization: {
          connect: { id: organizationId },
        },
        user: {
          connect: { id: userId },
        },
        role: role, // Role específico para o venue
        userPermissions: {
          create: venuesPermissions.map((item) => ({
            permissions: finalPermissions.join(','), // Define as permissões atualizadas como uma string separada por vírgula
            venueId: item.venueId, // Relaciona a permissão ao venue específico
          })),
        },
      },
    });

    return userOrganization;
  }

  async getById(reference: string): Promise<UserOrganization | null> {
    return await this.prisma.userOrganization.findFirst({
      where: {
        id: reference
      }
    })
  }

  async getByUserId(reference: string): Promise<UserOrganization | null> {
    return await this.prisma.userOrganization.findFirst({
      where: {
        userId: reference
      }
    })
  }

  async getByOrganizationId(reference: string): Promise<UserOrganization | null> {
    return await this.prisma.userOrganization.findFirst({
      where: {
        organizationId: reference
      }
    })
  }

  async delete(reference: string): Promise<UserOrganization | null> {
    return await this.prisma.userOrganization.delete({
      where: {
        id: reference
      }
    })
  }

  async list({ userId, name }: ListUserOrganizationRequestQuerySchema): Promise<UserOrganization[] | null> {
    return await this.prisma.userOrganization.findMany({
      where: {
        ...(name && {
          organization: {
            name
          }
        }),
        userId
      },
      include: {
        user: true,
        organization: true,
        userPermissions: true
      },
    })
  }
}
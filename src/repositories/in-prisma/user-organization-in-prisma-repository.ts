
import { PrismaClient, UserOrganization, UserPermission } from "@prisma/client"
import { UserOrganizationRepositoryInterface, UserOrganizationWithRelations } from "../interface/user-organization-repository-interface"
import { CreateUserOrganizationRequestParams } from "../../zod/user-organization/create-user-organization-params-schema"
import { ListUserOrganizationRequestQuerySchema } from "../../zod/user-organization/list-user-organization-query-schema"
import { ListUserOrganizationByOrganizationRequestQuerySchema } from "../../zod/user-organization/list-user-organization-by-organization-query-schema";
import { UpdateUserOrganizationRequestParams } from "../../zod/user-organization/update-user-organization-params-schema";



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

  }: CreateUserOrganizationRequestParams): Promise<UserOrganization | null> {
 
    const userOrganization = await this.prisma.userOrganization.create({
      data: {
        organization: {
          connect: { id: organizationId },
        },
        user: {
          connect: { id: userId },
        },
      },
    });

    return userOrganization;
  }
  
  async update({
    userOrganizationId,
    venuesPermissions,
  }: UpdateUserOrganizationRequestParams): Promise<UserOrganization | null> {
    if (!venuesPermissions || venuesPermissions.length === 0) {
      return null;
    }
  
    for (const item of venuesPermissions) {
      await this.prisma.userPermission.upsert({
        where: {
          userOrganizationId_venueId: {
            userOrganizationId,
            venueId: item.venueId,
          },
        },
        update: {
          role: item.role,
          permissions: item.permissions.join(','),
        },
        create: {
          userOrganizationId,
          venueId: item.venueId,
          role: item.role,
          permissions: item.permissions.join(','),
        },
      });
    }
  
    return await this.prisma.userOrganization.findUnique({
      where: { id: userOrganizationId },
      include: {
        user: true,
        organization: true,
        userPermissions: {
          include: {
            userOrganization: {
              select: {
                organizationId: true,
              },
            },
          },
        },
      },
    });
  }

  async getById(reference: string): Promise<UserOrganizationWithRelations | null> {
    return await this.prisma.userOrganization.findFirst({
      where: {
        id: reference
      },
      include: {
        user: true,
        userPermissions: {
          include:{
            userOrganization: {
              select:{
                organizationId: true
              }
            },
            venue: true
          }
        }
      },
    })
  }

  async verifyByUserIdAndOrganizationId({organizationId,userId}: {userId: string, organizationId: string}): Promise<UserOrganization | null> {
    return await this.prisma.userOrganization.findFirst({
      where: {
        organizationId,
        userId
      },
      include: {
        user: true,
        userPermissions: {
          include:{
            userOrganization: {
              select:{
                organizationId: true
              }
            },
            venue: true
          }
        }
      },
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
        userPermissions: {
          include:{
            userOrganization: {
              select:{
                organizationId: true
              }
            }
          }
        }
      },
    })
  }

  async listByOrganization({ organizationId, username }: ListUserOrganizationByOrganizationRequestQuerySchema): Promise<UserOrganization[] | null> {
    return await this.prisma.userOrganization.findMany({
      where: {
        ...(username && {
          user: {
            username
          }
        }),
        organizationId
      },
      include: {
        user: true,
        userPermissions: {
          include:{
            userOrganization: {
              select:{
                organizationId: true
              }
            },
            venue: true
          }
        }
      },
    })
  }
}
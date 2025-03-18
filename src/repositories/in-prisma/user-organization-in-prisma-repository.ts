
import { PrismaClient, UserOrganization, User, Permission, PermissionEnum } from "@prisma/client"
import { UserOrganizationRepositoryInterface } from "../interface/user-organization-repository-interface"
import { CreateUserOrganizationRequestParams } from "../../zod/user-organization/create-user-organization-params-schema"
import { ListUserOrganizationRequestQuerySchema } from "../../zod/user-organization/list-user-organization-query-schema"



export class PrismaUserOrganizationRepository implements UserOrganizationRepositoryInterface {

  constructor(private readonly prisma: PrismaClient) { }

  async  getPermissions(permissionNames: PermissionEnum[]): Promise<Permission[]> {
    const permissions = await this.prisma.permission.findMany({
      where: {
        name: {
          in: permissionNames, // Busca as permissões pelos nomes
        },
      },
    });
  
    // Se a permissão não existir, crie uma nova (isso pode ser adaptado conforme necessidade)
    const missingPermissions = permissionNames.filter(
      (name) => !permissions.some((perm) => perm.name === name)
    );
  
    const newPermissions = await Promise.all(
      missingPermissions.map((name) =>
        this.prisma.permission.create({
          data: { name: name as PermissionEnum }, // cria novas permissões
        })
      )
    );
  
    // Retorna todas as permissões (já existentes ou recém criadas)
    return [...permissions, ...newPermissions];
  }

  async create({
    organizationId,
    userId,
    venuesPermissions,  // Array de permissões por venue
  }: CreateUserOrganizationRequestParams): Promise<UserOrganization[] | null> {
    if (!venuesPermissions || venuesPermissions.length === 0) {
      return null;
    }
  
    // Cria um array de permissões
    const permissionsNames = venuesPermissions.flatMap((item) => item.permissions);
  
    // Verifica se as permissões já existem no banco ou cria novas
    const permissions = await this.getPermissions(permissionsNames);
  
    // Cria múltiplos UserOrganization
    const userOrganizations = await Promise.all(
      venuesPermissions.map(async (item) => {
        return await this.prisma.userOrganization.create({
          data: {
            organization: {
              connect: { id: organizationId },
            },
            user: {
              connect: { id: userId },
            },
            role: item.role, // Role específico para o venue
            permissions: {
              create: item.permissions.map((permissionName) => {
                const permission = permissions.find(
                  (perm) => perm.name === permissionName
                );
                return {
                  ...(permission && {
                    permission: { connect: { id: permission.id } },
                  }),
                  venueId: item.venueId, 
                };
              }),
            },
          },
        });
      })
    );
  
    return userOrganizations;
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

  async list({organizationId,username}: ListUserOrganizationRequestQuerySchema): Promise<UserOrganization[] | null> {
    return await this.prisma.userOrganization.findMany({
      where: {
        ...(username && {
          user: {
            username
          }
        }),
        organizationId
      },
      include:{
        user: true,
        organization: true
      },
    })
  }
}
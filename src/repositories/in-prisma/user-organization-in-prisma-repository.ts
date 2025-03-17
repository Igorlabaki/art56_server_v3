
import { PrismaClient, UserOrganization, User } from "@prisma/client"
import { UserOrganizationRepositoryInterface } from "../interface/user-organization-repository-interface"
import { CreateUserOrganizationRequestParams } from "../../zod/user-organization/create-user-organization-params-schema"
import { ListUserOrganizationRequestQuerySchema } from "../../zod/user-organization/list-user-organization-query-schema"



export class PrismaUserOrganizationRepository implements UserOrganizationRepositoryInterface {

  constructor(private readonly prisma: PrismaClient) { }

  async create({
    organizationId,
    userId,
    venuesPermissions,  // Array de permissões por venue
  }: CreateUserOrganizationRequestParams): Promise<UserOrganization[] | null> {
    // Verifica se há venuesPermissions
    if (!venuesPermissions || venuesPermissions.length === 0) {
      return null;
    }
  
    // Cria múltiplos UserOrganization
    const userOrganizations = await Promise.all(
      venuesPermissions.map(async (item) => {
        return await this.prisma.userOrganization.create({
          data: {
            organization: {
              connect: {
                id: organizationId,
              },
            },
            user: {
              connect: { id: userId },
            },
            role: item.role, // Role específico para o venue
            permissions: {
              create: item.permissions.map((permission) => ({
                permission: permission, // Cada permissão do venue
                venueId: item.venueId, // Associa ao venue correspondente
              })),
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
        user: true
      },
      take: 3
    })
  }
}
import { PrismaClient, UserOrganizationPermission, UserVenuePermission } from "@prisma/client"
import { CreateUserOrganizationPermissionRequestParams } from "../../zod/user-organization-permission/create-user-organization-permission-params-schema";
import { UpdateUserOrganizationPermissionRequestParams } from "../../zod/user-organization-permission/update-user-organization-permission-params-schema";
import { ListUserOrganizationPermissionByUserRequestQuerySchema } from "../../zod/user-organization-permission/list-user-organization-permission-by-query-schema";
import { UserOrganizationPermissionRepositoryInterface } from "../interface/user-organization-permission-repository-interface";
import { GetUserOrganizationPermissionSchema } from "../../zod/user-organization-permission/get-user-organization-permission-params-schema";

export class PrismaUserOrganizationPermissionRepository implements UserOrganizationPermissionRepositoryInterface {

  constructor(private readonly prisma: PrismaClient) { }

  async create({
    permissions,
    userOrganizationId,
    userId,
    organizationId,
    role
  }: CreateUserOrganizationPermissionRequestParams): Promise<UserOrganizationPermission | null> {
    // Se userOrganizationId foi fornecido, verificar se existe
    if (userOrganizationId) {
      const userOrganization = await this.prisma.userOrganization.findUnique({
        where: { id: userOrganizationId },
        include: { organization: true }
      });

      if (!userOrganization) {
        throw new Error(`UserOrganization com ID ${userOrganizationId} não encontrado`);
      }

      return await this.prisma.userOrganizationPermission.create({
        data: {
          role,
          permissions: permissions.join(','),
          userOrganization: {
            connect: {
              id: userOrganizationId
            }
          },
        }
      })
    }

    throw new Error("userOrganizationId é obrigatório para criar permissões");
  }

  async update(
    params
  : UpdateUserOrganizationPermissionRequestParams): Promise<UserOrganizationPermission | null> {
    const {permissions,userOrganizationPermissionId, role} =  params

    return await this.prisma.userOrganizationPermission.update({
      where: {
        id: userOrganizationPermissionId
      },
      data: {
        role,
        permissions: permissions ? permissions.join(',') : "",
      },
    });
  }

  async getById(reference: string): Promise<UserOrganizationPermission | null> {
    return await this.prisma.userOrganizationPermission.findFirst({
      where: {
        id: reference
      },
    })
  }


  async getByUserOrganizationPermission({userId, organizationId}: GetUserOrganizationPermissionSchema): Promise<UserOrganizationPermission | null> {

    return await this.prisma.userOrganizationPermission.findFirst({
      where: {
        userOrganization: {
          userId,
          organizationId
        }
      }
    })
  }

  async delete(reference: string): Promise<UserOrganizationPermission | null> {
    return await this.prisma.userOrganizationPermission.delete({
      where: {
        id: reference
      }
    })
  }

  async list({ userOrganizationId, role }: ListUserOrganizationPermissionByUserRequestQuerySchema ): Promise<UserOrganizationPermission[] | null> {
    return await this.prisma.userOrganizationPermission.findMany({
      where: {
        ...(role && {
          role
        }),
        userOrganizationId,
      }
    })
  }
}
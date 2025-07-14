import { PrismaClient, UserOrganizationPermission, UserVenuePermission } from "@prisma/client"
import { CreateUserOrganizationPermissionRequestParams } from "../../zod/user-organization-permission/create-user-organization-permission-params-schema";
import { UpdateUserOrganizationPermissionRequestParams } from "../../zod/user-organization-permission/update-user-organization-permission-params-schema";
import { ListUserOrganizationPermissionByUserRequestQuerySchema } from "../../zod/user-organization-permission/list-user-organization-permission-by-query-schema";
import { UserOrganizationPermissionRepositoryInterface } from "../interface/user-organization-permission-repository-interface";

export class PrismaUserOrganizationPermissionRepository implements UserOrganizationPermissionRepositoryInterface {

  constructor(private readonly prisma: PrismaClient) { }

  async create({
    permissions,
    userOrganizationId,
    userId
  }: CreateUserOrganizationPermissionRequestParams): Promise<UserOrganizationPermission | null> {
    return await this.prisma.userOrganizationPermission.create({
      data: {
        permissions: permissions.join(','),
        userOrganization: {
          connect: {
            id: userOrganizationId
          }
        },
      }
    })
  }

  async update(
    params
  : UpdateUserOrganizationPermissionRequestParams): Promise<UserOrganizationPermission | null> {
    const {permissions,userOrganizationPermissionId} =  params
    if (!permissions || permissions.length === 0) {
      return null;
    }

    return await this.prisma.userOrganizationPermission.update({
      where: {
        id: userOrganizationPermissionId
      },
      data: {
        permissions: permissions.join(','),
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


  async getByUserOrganizationPermissionId(reference: string): Promise<UserOrganizationPermission | null> {
    return await this.prisma.userOrganizationPermission.findFirst({
      where: {
        id: reference
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

  async list({ userOrganizationId }: ListUserOrganizationPermissionByUserRequestQuerySchema ): Promise<UserOrganizationPermission[] | null> {
    return await this.prisma.userOrganizationPermission.findMany({
      where: {
       userOrganizationId,
      }
    })
  }
}
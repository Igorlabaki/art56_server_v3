
import { PrismaClient, UserPermission } from "@prisma/client"
import { UserPermissionRepositoryInterface } from "../interface/user-permission-repository-interface"
import { CreateUserPermissionRequestParams } from "../../zod/user-permission/create-user-permission-params-schema"
import { UpdateUserPermissionRequestParams } from "../../zod/user-permission/update-user-permission-params-schema";
import { connect } from "http2";
import { ListUserPermissionByUserRequestQuerySchema } from "../../zod/user-permission/list-user-permission-by-query-schema";
import { GetUserPermissionSchema } from "../../zod/user-permission/get-user-permission-params-schema";

export class PrismaUserPermissionRepository implements UserPermissionRepositoryInterface {

  constructor(private readonly prisma: PrismaClient) { }

  async create({
    role,
    venueId,
    permissions,
    organizationId,
    userId
  }: CreateUserPermissionRequestParams): Promise<UserPermission | null> {
    return await this.prisma.userPermission.create({
      data: {
        permissions: permissions.join(','),
        venue: {
          connect: {
            id: venueId
          }
        },
        userOrganization: {
          connect: {
           userId_organizationId: {
            organizationId: organizationId,
            userId: userId
           }
          }
        },

        role,

      }
    })
  }

  async update(
    params
  : UpdateUserPermissionRequestParams): Promise<UserPermission | null> {
    const {permissions,userPermissionId,role,venueId} =  params
    if (!permissions || permissions.length === 0) {
      return null;
    }

    return await this.prisma.userPermission.update({
      where: {
        id: userPermissionId
      },
      data: {
        role: role,
        permissions: permissions.join(','),
      },
      include:{
        venue:{
          select:{
            name: true
          }
        }
      }
    });
  }

  async getById(reference: string): Promise<UserPermission | null> {
    return await this.prisma.userPermission.findFirst({
      where: {
        id: reference
      },
      include: {
       venue:{
        select:{
          name: true
        }
       }
      },
    })
  }

  async getByUserOrganization(reference: string): Promise<UserPermission | null> {
    return await this.prisma.userPermission.findFirst({
      where: {
        userOrganizationId: reference
      }

    })
  }

  async getUserPermission({userId,organizationId,venueId}: GetUserPermissionSchema): Promise<UserPermission | null> {
    return await this.prisma.userPermission.findFirst({
      where: {
        userOrganization: {
          userId: userId,
          organizationId: organizationId
        },
        ...(venueId && {
          venueId: venueId
        }),
      }
    })
  }

  async getByUserPermissionId(reference: string): Promise<UserPermission | null> {
    return await this.prisma.userPermission.findFirst({
      where: {
        id: reference
      }
    })
  }

  async delete(reference: string): Promise<UserPermission | null> {
    return await this.prisma.userPermission.delete({
      where: {
        id: reference
      }
    })
  }

  async list({ userOrganizationId,role,venueId }: ListUserPermissionByUserRequestQuerySchema ): Promise<UserPermission[] | null> {
    return await this.prisma.userPermission.findMany({
      where: {
       userOrganizationId,
       NOT: {
        venue: null
      },
      ...(role && {
        role: role
      }),
      ...(venueId && {
        venueId: venueId
      }),
      },
      include: {
        venue:{
          select:{
            name: true
          }
         }
      },
    })
  }
}
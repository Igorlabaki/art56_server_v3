
import { PrismaClient, UserVenuePermission } from "@prisma/client"
import { UserVenuePermissionRepositoryInterface } from "../interface/user-venue-permission-repository-interface";
import { CreateUserVenuePermissionRequestParams } from "../../zod/user-venue-permission/create-user-venue-permission-params-schema";
import { UpdateUserVenuePermissionRequestParams } from "../../zod/user-venue-permission/update-user-venue-permission-params-schema";
import { GetUserVenuePermissionSchema } from "../../zod/user-venue-permission/get-user-venue-permission-params-schema";
import { ListUserVenuePermissionByUserRequestQuerySchema } from "../../zod/user-venue-permission/list-user-venue-permission-by-query-schema";

export class PrismaUserVenuePermissionRepository implements UserVenuePermissionRepositoryInterface {

  constructor(private readonly prisma: PrismaClient) { }

  async create({
    venueId,
    permissions,
    organizationId,
    role,
    userId
  }: CreateUserVenuePermissionRequestParams): Promise<UserVenuePermission | null> {
    return await this.prisma.userVenuePermission.create({
      data: {
        permissions: permissions.join(','),
        venue: {
          connect: {
            id: venueId
          }
        },
        role,
        userOrganization: {
          connect: {
           userId_organizationId: {
            organizationId: organizationId,
            userId: userId
           }
          }
        },
      }
    })
  }

  async update(
    params
  : UpdateUserVenuePermissionRequestParams): Promise<UserVenuePermission | null> {
    const {permissions,userVenuePermissionId,role,venueId} =  params
 
    return await this.prisma.userVenuePermission.update({
      where: {
        id: userVenuePermissionId
      },
      data: {
        permissions: permissions ? permissions.join(',') : "",
        role,
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

  async getById(reference: string): Promise<UserVenuePermission | null> {
    return await this.prisma.userVenuePermission.findFirst({
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

  async getByUserOrganization(reference: string): Promise<UserVenuePermission | null> {
    return await this.prisma.userVenuePermission.findFirst({
      where: {
        userOrganizationId: reference
      }

    })
  }

  async getUserVenuePermission({userId,organizationId,venueId}: GetUserVenuePermissionSchema): Promise<UserVenuePermission | null> {
    return await this.prisma.userVenuePermission.findFirst({
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

  async getByUserVenuePermissionId(reference: string): Promise<UserVenuePermission | null> {
    return await this.prisma.userVenuePermission.findFirst({
      where: {
        id: reference
      }
    })
  }

  async delete(reference: string): Promise<UserVenuePermission | null> {
    return await this.prisma.userVenuePermission.delete({
      where: {
        id: reference
      }
    })
  }

  async list({ userOrganizationId,role,venueId }: ListUserVenuePermissionByUserRequestQuerySchema ): Promise<UserVenuePermission[] | null> {
    return await this.prisma.userVenuePermission.findMany({
      where: {
       userOrganizationId,
      ...(venueId && {
        venueId: venueId
      }),
      ...(role && {
        role
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
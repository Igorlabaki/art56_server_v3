import { PrismaClient, Organization,  } from "@prisma/client"
import { DeleteOrganizationSchema } from "../../zod/organization/delete-organization-params-schema"
import { ListOrganizationQuerySchema } from "../../zod/organization/list-organization-params-schema"
import { GetByIdOrganizationSchema } from "../../zod/organization/get-by-id-organization-params-schema"
import { CreateOrganizationRequestParams } from "../../zod/organization/create-organization-params-schema"
import { OrganizationRepositoryInterface, UpdateOrganizationRequestParams } from "../interface/organization-repository-interface"


export class PrismaOrganizationRepository implements OrganizationRepositoryInterface {

  constructor(private readonly prisma: PrismaClient) { }

  async  create({ name, userId }: CreateOrganizationRequestParams): Promise<Organization | null> {
    const permissions: string = "EDIT_ORGANIZATION";

    return await this.prisma.organization.create({
      data: {
        name,
        userOrganizations: {
          create: {
            userId: userId,
            userPermissions: {
              create: [
                {
                  role: "ADMIN",
                  venueId: null ,// Pode ser nulo ou você pode definir para um venue específico
                  permissions: permissions, // A permissão é agora uma string
                }
              ]
            }
          }
        }
      }
    });
  }
  
  async update(reference: UpdateOrganizationRequestParams): Promise<Organization | null> {
    return await this.prisma.organization.update({
      where: {
        id: reference.organizationId
      },
      data: {
        ...reference.data
      },
      include: {
        owners: true,
        venues: {
          select: {
            id: true,
            name: true,
            images: true,
          },
        },
      }
    })
  }

  async getById({ organizationId, venueName }: GetByIdOrganizationSchema): Promise<Organization | null> {
    return await this.prisma.organization.findFirst({
      where: {
        id: organizationId,
        ...(venueName && {
          venues: {
            some: {
              name: {
                contains: venueName,
              },
            },
          }
        }),
      },
      include: {
        owners: true,
        venues: {
          select: {
            id: true,
            name: true,
            images: true,
          },
          where: venueName
            ? {
              name: {
                contains: venueName,
              },
            }
            : undefined,
        },
      },
    })
  }

  async delete({ organizationId }: DeleteOrganizationSchema): Promise<Organization | null> {
    return await this.prisma.organization.delete({
      where: {
        id: organizationId
      }
    })
  }

  async list({ userId, name }: ListOrganizationQuerySchema): Promise<Organization[] | null> {
    return await this.prisma.organization.findMany({
      where: {
        userOrganizations: {
          some: {
            userId: userId
          }
        },
        ...(name && {
          name: {
            contains: name,
          },
        }),
      },
    })
  }
}
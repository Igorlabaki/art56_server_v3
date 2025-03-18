import dayjs from "dayjs"

import { PrismaClient, Organization, User, PermissionEnum } from "@prisma/client"
import { CreateOrganizationParams, OrganizationRepositoryInterface, UpdateOrganizationRequestParams } from "../interface/organization-repository-interface"
import { CreateOrganizationRequestParams } from "../../zod/organization/create-organization-params-schema"
import { ListOrganizationQuerySchema } from "../../zod/organization/list-organization-params-schema"
import { GetByIdOrganizationSchema } from "../../zod/organization/get-by-id-organization-params-schema"
import { DeleteOrganizationSchema } from "../../zod/organization/delete-organization-params-schema"


export class PrismaOrganizationRepository implements OrganizationRepositoryInterface {

  constructor(private readonly prisma: PrismaClient) { }

  async create({ name, userId }: CreateOrganizationRequestParams): Promise<Organization | null> {
    // Defina as permissões que o usuário terá
    const permissions : PermissionEnum[] = [
      "EDIT_ORGANIZATION"
    ];
  
    // Crie as permissões no banco de dados
    const permissionsData = await Promise.all(
      permissions.map((permissionName) =>
        this.prisma.permission.upsert({
          where: { name: permissionName },
          update: {}, // Se já existir, não faz nada
          create: { name: permissionName }, // Caso contrário, cria
        })
      )
    );
  
    // Criação da organização e do UserOrganization com as permissões associadas
    return await this.prisma.organization.create({
      data: {
        name,
        userOrganizations: {
          create: {
            userId: userId,
            role: "ADMIN", // Pode definir o papel como ADMIN ou outro
            permissions: {
              create: permissionsData.map((permission) => ({
                permission: { connect: { id: permission.id } }, // Conectar a permissão criada
              })),
            },
          },
        },
      },
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
          every: {
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
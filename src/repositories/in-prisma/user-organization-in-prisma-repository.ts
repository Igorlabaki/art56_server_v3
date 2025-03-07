import dayjs from "dayjs"

import { PrismaClient, UserOrganization, User } from "@prisma/client"

import { UserOrganizationRepositoryInterface } from "../interface/user-organization-repository-interface"
import { CreateUserOrganizationRequestParams } from "../../zod/user-organization/create-user-organization-params-schema"
import { connect } from "http2"
import { ListUserOrganizationRequestQuerySchema } from "../../zod/user-organization/list-user-organization-query-schema"



export class PrismaUserOrganizationRepository implements UserOrganizationRepositoryInterface {

  constructor(private readonly prisma: PrismaClient) { }

  async create({
    organizationId,
    userId,
    role,
    venuesPermissions,  // Aqui você passaria as permissões específicas para os venues
  }: CreateUserOrganizationRequestParams): Promise<UserOrganization | null> {
  
    // Cria o UserOrganization
    const userOrganization = await this.prisma.userOrganization.create({
      data: {
        organization: {
          connect: {
            id: organizationId,
          },
        },
        user: {
          connect: { id: userId },
        },
        role,
        // Aqui você pode adicionar as permissões globais diretamente
        permissions: {
          create: venuesPermissions.map((item:any)=> ({
            permission: item.permission,   // Exemplo: "VIEW_INFO", "EDIT_EVENT", etc.
            venueId: item.venueId || null,   // Se o venueId for passado, ótimo, se não for, será nulo (permissão global)
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
      }
    })
  }
}
import dayjs from "dayjs"

import { PrismaClient, UserOrganization, User } from "@prisma/client"

import { UserOrganizationRepositoryInterface } from "../interface/user-organization-repository-interface"
import { CreateUserOrganizationRequestParams } from "../../zod/user-organization/create-user-organization-params-schema"
import { connect } from "http2"



export class PrismaUserOrganizationRepository implements UserOrganizationRepositoryInterface {

  constructor(private readonly prisma: PrismaClient) { }

  async create({ permissions, organizationId, userId, role }: CreateUserOrganizationRequestParams): Promise<UserOrganization | null> {

    return await this.prisma.userOrganization.create({
      data: {
        organization: {
          connect: {
            id: organizationId
          }
        },
        user: {
          connect: { id: userId },
        },
        permissions: {
          connect: permissions.map((permissionId) => ({ id: permissionId })),
        },
        role
      },
    })
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

  async list(parmas: string): Promise<UserOrganization[] | null> {
    return await this.prisma.userOrganization.findMany({
      where: {
        userId: parmas
      }
    })
  }
}
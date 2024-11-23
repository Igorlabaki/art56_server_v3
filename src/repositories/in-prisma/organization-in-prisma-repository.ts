import dayjs from "dayjs"

import { PrismaClient, Organization, User } from "@prisma/client"
import { CreateOrganizationParams, OrganizationRepositoryInterface, UpdateOrganizationRequestParams } from "../interface/organization-repository-interface"
import { CreateOrganizationRequestParams } from "../../zod/organization/create-organization-params-schema"


export class PrismaOrganizationRepository implements OrganizationRepositoryInterface {

    constructor (private readonly prisma: PrismaClient){}
  
    async create ({name,userId}: CreateOrganizationRequestParams): Promise<Organization | null> {
      return await this.prisma.organization.create({
        data:{
          name,
          userOrganizations:{
            create: {
              userId: userId,
            }
          }
        },
      })
    }
  
    async update (reference: UpdateOrganizationRequestParams): Promise<Organization  | null> {
      return await this.prisma.organization.update({
        where:{
          id: reference.organizationId
        },
        data:{
          ...reference.data
        }
      })
    }

    async getById (reference: string): Promise<Organization  | null> {
      return await this.prisma.organization.findFirst({
        where:{
          id: reference
        }
      })
    }

    async delete (reference: string): Promise<Organization | null> {
      return await this.prisma.organization.delete({
        where:{
            id: reference
        }
      })
    }
  }
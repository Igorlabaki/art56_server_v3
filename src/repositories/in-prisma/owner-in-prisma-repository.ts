import dayjs from "dayjs"

import { PrismaClient, Owner, User } from "@prisma/client"
import { CreateOwnerRequestParams } from "../../zod/owner/create-owner-params-schema"
import { OwnerRepositoryInterface } from "../interface/owner-repository-interface"


export class PrismaOwnerRepository implements OwnerRepositoryInterface {

    constructor (private readonly prisma: PrismaClient){}
  
    async create (params: CreateOwnerRequestParams): Promise<Owner | null> {
      return await this.prisma.owner.create({
        data:{
        ...params
        },
      })
    }
  
   /*  async update (reference: UpdateOwnerRequestParams): Promise<Owner  | null> {
      return await this.prisma.owner.update({
        where:{
          id: reference.ownerId
        },
        data:{
          ...reference.data
        }
      })
    } */

    async getById (reference: string): Promise<Owner  | null> {
      return await this.prisma.owner.findFirst({
        where:{
          id: reference
        }
      })
    }

    async delete (reference: string): Promise<Owner | null> {
      return await this.prisma.owner.delete({
        where:{
            id: reference
        }
      })
    }

    async list (reference: string): Promise<Owner[] | null> {
      return await this.prisma.owner.findMany({
        
      })
    }
  }
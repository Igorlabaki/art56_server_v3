import { PrismaClient, User } from "@prisma/client"
import { UserRepositoryInterface } from "../interface/user-repository-interface"
import { RegisterUserRequestParams } from "../../zod/registerUserParamsSchema"

export class PrismaUserRepository implements UserRepositoryInterface {

    constructor (private readonly prisma: PrismaClient){}
  
    async register (params: RegisterUserRequestParams): Promise<User | null> {
      return await this.prisma.user.create({
        data:{
          ...params
        }
      })
    }
  
    async getById (reference: string): Promise<User  | null> {
      return await this.prisma.user.findFirst({
        where:{
          id: reference
        }
      })
    }

    async getByEmail (reference: string): Promise<User  | null> {
      return await this.prisma.user.findFirst({
        where:{
          email: reference
        }
      })
    }
  
    async delete (reference: string): Promise<User | null> {
      return await this.prisma.user.delete({
        where:{
            id: reference
        }
      })
    }
  }
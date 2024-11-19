import { PrismaClient, User } from "@prisma/client"
import { UserRepositoryInterface } from "../interface/user-repository-interface"
import { RegisterUserRequestParams } from "../../zod/register-user-params-schema"
import { UpdateUserPasswordRequestParams } from "../../zod/update-user-password-params-schema"

export class PrismaUserRepository implements UserRepositoryInterface {

  constructor(private readonly prisma: PrismaClient) { }

  async register(params: RegisterUserRequestParams): Promise<User | null> {
    return await this.prisma.user.create({
      data: {
        ...params
      }
    })
  }

  async getById(reference: string): Promise<User | null> {
    return await this.prisma.user.findFirst({
      where: {
        id: reference
      }
    })
  }

  async getByEmail(reference: string): Promise<User | null> {
    return await this.prisma.user.findFirst({
      where: {
        email: reference
      }
    })
  }

  async updatePassword({ password, email }: UpdateUserPasswordRequestParams): Promise<User | null> {
    return await this.prisma.user.update({
      where: {
        email: email
      },
      data: {
        password: password
      }
    })
  }

  async delete(reference: string): Promise<User | null> {
    return await this.prisma.user.delete({
      where: {
        id: reference
      }
    })
  }
}
import { PrismaClient, User } from "@prisma/client"
import { UserRepositoryInterface, UserWithPartial } from "../interface/user-repository-interface"
import { RegisterUserRequestParams } from "../../zod/auth/register-user-params-schema"
import { UpdateUserPasswordRequestParams } from "../../zod/auth/update-user-password-params-schema"
import { UpdateUserRequestParams } from "../../zod/user/update-user-params-schema"
import { ListUserRequestQuerySchema } from "../../zod/user/list-user-query-schema"

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

  async getByGoogleId(reference: string): Promise<User | null> {
    return await this.prisma.user.findFirst({
      where: {
        googleId: reference
      }
    })
  }

  async update({ userId, ...rest }: UpdateUserRequestParams): Promise<UserWithPartial | null> {
    return await this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        ...rest
      },
      select:{
        avatarUrl: true,
        email: true,
        username: true,
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


  async list({email,organizationId}: ListUserRequestQuerySchema): Promise<User[] | null>{
    return await this.prisma.user.findMany({
      where: {
        ...(email && {
          email: {
            contains: email
          }
        }),
        userOrganizations:{
          none:{
            organizationId
          }
        }
      }
    })
  }
}
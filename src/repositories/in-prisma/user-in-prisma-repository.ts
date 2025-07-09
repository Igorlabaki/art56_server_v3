import { PrismaClient, User } from "@prisma/client"
import { UpdateUserRequestParams } from "../../zod/user/update-user-params-schema"
import { ListUserRequestQuerySchema } from "../../zod/user/list-user-query-schema"
import { UpdatePasswordDbSchema } from "../../zod/auth/update-password-db-schema"
import { ForgotPasswordDbParams } from "../../zod/auth/forgot-password-db-schema"
import { RegisterUserRequestParams } from "../../zod/auth/register-user-params-schema"
import { UserRepositoryInterface, UserWithPartial } from "../interface/user-repository-interface"
import { ResetPasswordRequestParams } from "../../zod/auth/reset-password-params-schema"
import { GetByPasswordResetToken } from "../../zod/auth/get-password-reset-token-params-schema copy"

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
        email: reference,
      },
    })
  }

  async updatePassword({ password, userId }: UpdatePasswordDbSchema
  ): Promise<User | null> {
    return await this.prisma.user.update({
      where: {
        id: userId
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
      select: {
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

  async updateFcmToken(userId: string, fcmToken: string): Promise<User | null> {
    return await this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        fcmToken: fcmToken
      }
    })
  }

  async list({ email, organizationId }: ListUserRequestQuerySchema): Promise<User[] | null> {
    return await this.prisma.user.findMany({
      where: {
        ...(email && {
          email: {
            contains: email
          }
        }),
        userOrganizations: {
          none: {
            organizationId
          }
        }
      }
    })
  }

  async forgotPassword({ email, passwordResetToken, passwordResetExpires }: ForgotPasswordDbParams): Promise<User | null> {
    return await this.prisma.user.update({
      where: {
        email: email
      },
      data: {
        passwordResetToken: passwordResetToken,
        passwordResetExpires: passwordResetExpires
      }
    })
  }

  async getByPasswordResetToken({ token }: GetByPasswordResetToken): Promise<User | null> {
    return await this.prisma.user.findFirst({
      where: { passwordResetToken: token }
    });
  }

  async resetPassword({ token, newPassword }: ResetPasswordRequestParams): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: { passwordResetToken: token }
    });
    if (!user) return null;

    // 2. Atualizar pelo id
    return await this.prisma.user.update({
      where: { id: user.id },
      data: { password: newPassword }
    });
  }
}
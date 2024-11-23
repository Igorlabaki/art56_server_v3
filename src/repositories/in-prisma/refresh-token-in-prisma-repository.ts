import dayjs from "dayjs"

import { PrismaClient, RefreshToken } from "@prisma/client"
import { RefreshTokenRepositoryInterface } from "../interface/refresh-token-repository-interface"

export class PrismaRefreshTokenRepository implements RefreshTokenRepositoryInterface {

  constructor(private readonly prisma: PrismaClient) { }

  async create(reference: string): Promise<RefreshToken | null> {

    const expireIn = dayjs().add(10, 'days').unix()

    return await this.prisma.refreshToken.create({
      data: {
        user: {
          connect: {
            id: reference
          }
        },
        expireIn: expireIn
      }
    })

  }

  async get(reference: string): Promise<RefreshToken | null> {
    return await this.prisma.refreshToken.findFirst({
      where: {
        userId: reference,
      },
      orderBy: {
        createdAt: 'desc',
      }
    })
  }

  async delete(reference: string): Promise<RefreshToken | null> {
    return await this.prisma.refreshToken.delete({
      where: {
        id: reference
      }
    })
  }
}
import dayjs from "dayjs"

import { PrismaClient, Session } from "@prisma/client"
import { CreateSessionRequestParams, SessionRepositoryInterface } from "../interface/session-repository-interface"

export class PrismaSessionRepository implements SessionRepositoryInterface {

    constructor (private readonly prisma: PrismaClient){}
  
    async create (params: CreateSessionRequestParams): Promise<Session | null> {
      return await this.prisma.session.create({
        data:{
          userId: params?.userId,
          refreshTokenId: params?.refreshTokenId,
          expiresAt: dayjs().add(10, 'day').toDate(), 
        }
      })
    }
  
    async getById (reference: string): Promise<Session  | null> {
      return await this.prisma.session.findFirst({
        where:{
          id: reference
        }
      })
    }

    async delete (reference: string): Promise<Session | null> {
      return await this.prisma.session.delete({
        where:{
            id: reference
        }
      })
    }
  }
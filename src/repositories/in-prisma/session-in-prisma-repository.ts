import dayjs from "dayjs"

import { PrismaClient, Session, User } from "@prisma/client"
import { CreateSessionRequestParams, SessionRepositoryInterface, UpdateSessionRequestParams } from "../interface/session-repository-interface"

export class PrismaSessionRepository implements SessionRepositoryInterface {

    constructor (private readonly prisma: PrismaClient){}
  
    async create (params: CreateSessionRequestParams): Promise<Session | null> {
      return await this.prisma.session.create({
        data:{
          ...params
        },
        include:{
          user: {
            select:{
              email: true,
              username: true,
            }
          }
        },
      })
    }
  
    async update (reference: UpdateSessionRequestParams): Promise<Session  | null> {
      return await this.prisma.session.update({
        where:{
          id: reference.sessionId
        },
        data:{
          ...reference.data
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

    async getByUserId (reference: string): Promise<Session & { user: Partial<User> }  | null> {
      return await this.prisma.session.findFirst({
        where:{
          userId: reference
        },
        include:{
          user: {
            select:{
              email: true,
              username: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc',
        },
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
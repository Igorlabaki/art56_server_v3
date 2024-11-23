import dayjs from "dayjs"

import { PrismaClient, Notification, User } from "@prisma/client"
import { CreateNotificationRequestParams } from "../../zod/notification/create-notification-params-schema"
import { NotificationRepositoryInterface } from "../interface/notification-repository-interface"

export class PrismaNotificationRepository implements NotificationRepositoryInterface {

    constructor (private readonly prisma: PrismaClient){}
  
    async create (params: CreateNotificationRequestParams): Promise<Notification | null> {
      return await this.prisma.notification.create({
        data:{
          ...params
        },
      })
    }
  
   /*  async update (reference: UpdateNotificationRequestParams): Promise<Notification  | null> {
      return await this.prisma.notification.update({
        where:{
          id: reference.notificationId
        },
        data:{
          ...reference.data
        }
      })
    } */

    async getById (reference: string): Promise<Notification  | null> {
      return await this.prisma.notification.findFirst({
        where:{
          id: reference
        }
      })
    }

    async delete (reference: string): Promise<Notification | null> {
      return await this.prisma.notification.delete({
        where:{
            id: reference
        }
      })
    }

    async list (reference: string): Promise<Notification[] | null> {
      return await this.prisma.notification.findMany({
        
      })
    }
  }
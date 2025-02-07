import { PrismaClient, Notification, User } from "@prisma/client";
import { NotificationRepositoryInterface } from "../interface/notification-repository-interface";
import { ListNotificationRequestQuerySchema } from "../../zod/notification/list-notification-query-schema";
import { CreateNotificationRequestParams } from "../../zod/notification/create-notification-params-schema";
import { DeleteNotificationRequestParamSchema } from "../../zod/notification/delete-notification-param-schema";
import { GetByidNotificationRequestParamSchema } from "../../zod/notification/get-by-id-notification-param-schema";
export class PrismaNotificationRepository implements NotificationRepositoryInterface {

  constructor(private readonly prisma: PrismaClient) { }

  async create(params: CreateNotificationRequestParams): Promise<Notification | null> {
    const { dataEventId, proposalId, venueId, ...rest } = params
    return await this.prisma.notification.create({
      data: {
        ...(dataEventId && {
          dateEvent: {
            connect: {
              id: dataEventId
            }
          }
        }),
        ...(proposalId && {
          proposal: {
            connect: {
              id: proposalId
            }
          }
        }),
        venue: {
          connect: {
            id: venueId
          }
        },
        ...rest
      },
    })
  }

  async getById(reference: GetByidNotificationRequestParamSchema): Promise<Notification | null> {
    return await this.prisma.notification.findFirst({
      where: {
        id: reference.notificationId
      }
    })
  }

  async delete(reference: DeleteNotificationRequestParamSchema): Promise<Notification | null> {
    return await this.prisma.notification.delete({
      where: {
        id: reference.notificationId
      }
    })
  }

  async list(reference: string): Promise<Notification[] | null> {
    return await this.prisma.notification.findMany({
      where: {
        venueId: reference
      },
      orderBy:{
        createdAt: "desc"
      }
    })
  }
}
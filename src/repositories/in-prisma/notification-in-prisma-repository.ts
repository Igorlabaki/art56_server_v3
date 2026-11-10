import { Prisma, PrismaClient, Notification, NotificationType } from "@prisma/client";
import { NotificationListDbQuery, NotificationListSummaryCounts, NotificationRepositoryInterface } from "../interface/notification-repository-interface";
import { CreateNotificationRequestParams } from "../../zod/notification/create-notification-params-schema";
import { DeleteNotificationRequestParamSchema } from "../../zod/notification/delete-notification-param-schema";
import { GetByidNotificationRequestParamSchema } from "../../zod/notification/get-by-id-notification-param-schema";

const DAY_MS = 24 * 60 * 60 * 1000;

export function notificationListWhere(query: NotificationListDbQuery): Prisma.NotificationWhereInput {
  return {
    venueId: query.venueId,
    ...(query.q ? { content: { contains: query.q } } : {}),
    ...(query.type ? { type: query.type } : {}),
    ...(query.isRead !== undefined ? { isRead: query.isRead } : {}),
  };
}

function intersectWhere(
  base: Prisma.NotificationWhereInput,
  extra: { isRead?: boolean; type?: NotificationType },
): Prisma.NotificationWhereInput | null {
  if (extra.isRead !== undefined && base.isRead !== undefined && extra.isRead !== base.isRead) return null;
  if (extra.type !== undefined && base.type !== undefined && extra.type !== base.type) return null;
  return { ...base, ...extra };
}

export function notificationSummaryWheres(query: NotificationListDbQuery, now: Date) {
  const base = notificationListWhere(query);
  const since7 = new Date(now.getTime() - 7 * DAY_MS);
  const since14 = new Date(now.getTime() - 14 * DAY_MS);
  const since30 = new Date(now.getTime() - 30 * DAY_MS);
  const since60 = new Date(now.getTime() - 60 * DAY_MS);
  return {
    unread: intersectWhere(base, { isRead: false }),
    last7Days: { ...base, createdAt: { gte: since7 } },
    last30Days: { ...base, createdAt: { gte: since30 } },
    newProposals: intersectWhere({ ...base, createdAt: { gte: since30 } }, { type: "PROPOSAL" }),
    previous: {
      last7Days: { ...base, createdAt: { gte: since14, lt: since7 } },
      last30Days: { ...base, createdAt: { gte: since60, lt: since30 } },
      newProposals: intersectWhere({ ...base, createdAt: { gte: since60, lt: since30 } }, { type: "PROPOSAL" }),
    },
  };
}
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

  async list(query: NotificationListDbQuery): Promise<{ items: Notification[]; total: number }> {
    const where = notificationListWhere(query);
    const orderBy = [{ createdAt: "desc" as const }, { id: "desc" as const }];
    const [total, items] = await Promise.all([
      this.prisma.notification.count({ where }),
      this.prisma.notification.findMany({
        where,
        orderBy,
        skip: query.skip ?? 0,
        take: query.take,
      }),
    ]);
    return { items, total };
  }

  async summarize(query: NotificationListDbQuery): Promise<NotificationListSummaryCounts> {
    const wheres = notificationSummaryWheres(query, query.now ?? new Date());
    const countOrZero = (where: Prisma.NotificationWhereInput | null) =>
      where ? this.prisma.notification.count({ where }) : Promise.resolve(0);
    const [unread, last7Days, last30Days, newProposals, previous7Days, previous30Days, previousProposals] = await Promise.all([
      countOrZero(wheres.unread),
      countOrZero(wheres.last7Days),
      countOrZero(wheres.last30Days),
      countOrZero(wheres.newProposals),
      countOrZero(wheres.previous.last7Days),
      countOrZero(wheres.previous.last30Days),
      countOrZero(wheres.previous.newProposals),
    ]);
    return {
      unread,
      last7Days,
      last30Days,
      newProposals,
      previous: { last7Days: previous7Days, last30Days: previous30Days, newProposals: previousProposals },
    };
  }

  async markUnreadAsRead(params: { venueId: string; proposalId?: string }): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: {
        venueId: params.venueId,
        isRead: false,
        ...(params.proposalId ? { proposalId: params.proposalId } : {}),
      },
      data: { isRead: true },
    });
    return result.count;
  }
}
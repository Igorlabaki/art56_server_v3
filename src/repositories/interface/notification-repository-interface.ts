import { Notification, NotificationType } from "@prisma/client";
import { CreateNotificationRequestParams } from "../../zod/notification/create-notification-params-schema";
import { DeleteNotificationRequestParamSchema } from "../../zod/notification/delete-notification-param-schema";
import { GetByidNotificationRequestParamSchema } from "../../zod/notification/get-by-id-notification-param-schema";

export interface NotificationListDbQuery {
  venueId: string;
  q?: string;
  type?: NotificationType;
  isRead?: boolean;
  skip?: number;
  take?: number;
  now?: Date;
}

type NotificationPeriodCounts<T> = {
  last7Days: T;
  last30Days: T;
  newProposals: T;
};

export interface NotificationListSummaryCounts extends NotificationPeriodCounts<number> {
  unread: number;
  /** Janela imediatamente anterior, de mesmo tamanho, de cada contagem de periodo. */
  previous: NotificationPeriodCounts<number>;
}

export interface NotificationListSummary extends NotificationPeriodCounts<number> {
  unread: number;
  /** Percentual inteiro contra a janela anterior; `null` quando a janela anterior e 0. */
  change: NotificationPeriodCounts<number | null>;
}

export interface NotificationRepositoryInterface {
  create: (params: CreateNotificationRequestParams) => Promise<Notification | null>
  list: (params: NotificationListDbQuery) => Promise<{ items: Notification[]; total: number }>
  summarize: (params: NotificationListDbQuery) => Promise<NotificationListSummaryCounts>
  markUnreadAsRead: (params: { venueId: string; proposalId?: string }) => Promise<number>
  delete: (params: DeleteNotificationRequestParamSchema) => Promise<Notification | null>
  getById: (params: GetByidNotificationRequestParamSchema) => Promise<Notification | null>
}
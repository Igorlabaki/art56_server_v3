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

export interface NotificationListSummary {
  unread: number;
  last7Days: number;
  last30Days: number;
  newProposals: number;
}

export interface NotificationRepositoryInterface {
  create: (params: CreateNotificationRequestParams) => Promise<Notification | null>
  list: (params: NotificationListDbQuery) => Promise<{ items: Notification[]; total: number }>
  summarize: (params: NotificationListDbQuery) => Promise<NotificationListSummary>
  markUnreadAsRead: (params: { venueId: string; proposalId?: string }) => Promise<number>
  delete: (params: DeleteNotificationRequestParamSchema) => Promise<Notification | null>
  getById: (params: GetByidNotificationRequestParamSchema) => Promise<Notification | null>
}
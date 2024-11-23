import { Notification, User } from "@prisma/client";
import { CreateNotificationRequestParams } from "../../zod/notification/create-notification-params-schema";

export interface NotificationRepositoryInterface {
  list: (params: string) => Promise<Notification[]  | null>
  delete: (params: string) => Promise<Notification | null>
  getById: (params: string) => Promise<Notification | null>
  /* update: (params: UpdateNotificationRequestParams) => Promise<Notification | null> */
  create: (params: CreateNotificationRequestParams) => Promise<Notification | null>
}
import { Notification } from "@prisma/client";
import { CreateNotificationRequestParams } from "../../zod/notification/create-notification-params-schema";
import { ListNotificationRequestQuerySchema } from "../../zod/notification/list-notification-query-schema";
import { DeleteNotificationRequestParamSchema } from "../../zod/notification/delete-notification-param-schema";
import { GetByidNotificationRequestParamSchema } from "../../zod/notification/get-by-id-notification-param-schema";
export interface NotificationRepositoryInterface {
  create: (params: CreateNotificationRequestParams) => Promise<Notification | null>
  list: (params: string) => Promise<Notification[]  | null>
  delete: (params: DeleteNotificationRequestParamSchema) => Promise<Notification | null>
  getById: (params: GetByidNotificationRequestParamSchema) => Promise<Notification | null>
}
import { Notification } from "@prisma/client";
import { NotificationListDbQuery, NotificationListSummary, NotificationRepositoryInterface } from "../../../repositories/interface/notification-repository-interface";
import { ListNotificationRequestQuerySchema } from "../../../zod/notification/list-notification-query-schema";

const PAGE_SIZE = 10;
const UNPAGED_LIMIT = 25;

type ListNotificationsResponse = {
  success: true;
  message: string;
  data: {
    notificationList: Notification[];
    summary?: NotificationListSummary;
  };
  count: number;
  type: "List";
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

class ListNotificationsUseCase {
  constructor(private notificationRepository: NotificationRepositoryInterface) { }

  async execute(query: ListNotificationRequestQuerySchema): Promise<ListNotificationsResponse> {
    const paged = query.page !== undefined;
    const dbQuery: NotificationListDbQuery = {
      venueId: query.venueId,
      q: query.q,
      type: query.type,
      isRead: query.isRead,
      skip: paged ? (query.page! - 1) * PAGE_SIZE : 0,
      take: paged ? PAGE_SIZE : UNPAGED_LIMIT,
    };
    const summaryQuery: NotificationListDbQuery = {
      venueId: dbQuery.venueId,
      q: dbQuery.q,
      type: dbQuery.type,
      isRead: dbQuery.isRead,
      now: new Date(),
    };

    const [{ items, total }, summary] = await Promise.all([
      this.notificationRepository.list(dbQuery),
      query.summary ? this.notificationRepository.summarize(summaryQuery) : Promise.resolve(null),
    ]);

    const body: ListNotificationsResponse = {
      success: true,
      message: `Lista de notificationos com ${items.length} items`,
      data: {
        notificationList: items,
        ...(summary ? { summary } : {}),
      },
      count: items.length,
      type: "List",
    };

    if (!paged) return body;

    return {
      ...body,
      pagination: {
        page: query.page!,
        pageSize: PAGE_SIZE,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / PAGE_SIZE),
      },
    };
  }
}

export { ListNotificationsUseCase };

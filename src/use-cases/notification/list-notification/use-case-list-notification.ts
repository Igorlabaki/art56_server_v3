import { ListNotificationRequestQuerySchema } from "../../../zod/notification/list-notification-query-schema";
import { NotificationRepositoryInterface } from "../../../repositories/interface/notification-repository-interface";

class ListNotificationsUseCase {
  constructor(private notificationRepository: NotificationRepositoryInterface) { }

  async execute(venueId: string) {
    const notificationList = await this.notificationRepository.list(venueId);

    const formatedResponse = {
      success: true,
      message: `Lista de notificationos com ${notificationList?.length} items`,
      data: {
        notificationList: notificationList
      },
      count: notificationList?.length,
      type: "List"
    }

    return formatedResponse;
  }
}

export { ListNotificationsUseCase };

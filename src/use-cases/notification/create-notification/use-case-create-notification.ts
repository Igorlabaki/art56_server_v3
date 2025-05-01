import { HttpConflictError } from "../../../errors/errors-type/htttp-conflict-error";
import { NotificationRepositoryInterface } from "../../../repositories/interface/notification-repository-interface";
import { CreateNotificationRequestParams } from "../../../zod/notification/create-notification-params-schema";
import { NotificationService } from "../../../service/notification-service";

class CreateNotificationUseCase {
  constructor(
    private notificationRepository: NotificationRepositoryInterface,
    private notificationService: NotificationService
  ) {}

  async execute(param: CreateNotificationRequestParams) {
    const newNotification = await this.notificationRepository.create(param);

    // Envia notificação em tempo real
    await this.notificationService.sendProposalNotification(
      param.venueId,
      param.proposalId || '',
      param.content
    );

    const formatedResponse = {
      success: true,
      message: "Notificacao foi criada com sucesso",
      data: {
         ...newNotification
      },
      count: 1,
      type: "Notification"
    } 

    return formatedResponse;
  }
}

export { CreateNotificationUseCase };

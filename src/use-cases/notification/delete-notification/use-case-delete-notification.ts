
import { DeleteNotificationRequestParamSchema } from "../../../zod/notification/delete-notification-param-schema"
import { NotificationRepositoryInterface } from "../../../repositories/interface/notification-repository-interface"
import { HttpResourceNotFoundError } from "../../../errors/errors-type/http-resource-not-found-error"

class DeleteNotificationUseCase {
    constructor(private notificationRepository: NotificationRepositoryInterface) { }

    async execute(param: DeleteNotificationRequestParamSchema) {

        // Validate if notification exists
        const notification = await this.notificationRepository.getById(param)

        if (!notification) {
            throw new HttpResourceNotFoundError("Notificacao")
        }
        //

        const deletedNotification = await this.notificationRepository.delete(param)

        const formatedResponse = {
            success: true,
            message: `Notificacao deletada com sucesso`,
            data: {
                ...deletedNotification
            },
            count: 1,
            type: "Notification"
        }

        return formatedResponse
    }
}

export { DeleteNotificationUseCase }

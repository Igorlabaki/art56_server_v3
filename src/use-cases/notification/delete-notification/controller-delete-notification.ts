import { Request, Response } from "express"
import { handleErrors } from "../../../errors/error-handler";
import { DeleteNotificationUseCase } from "./use-case-delete-notification";
import { deleteNotificationRequestParamSchema } from "../../../zod/notification/delete-notification-param-schema";


class DeleteNotificationController {
    constructor(private deleteNotificationUseCase: DeleteNotificationUseCase) { }
    async handle(req: Request, resp: Response) {
        try {
            const param = deleteNotificationRequestParamSchema.parse(req.params);
            const notificationById = await this.deleteNotificationUseCase.execute(param);
            
            return resp.json(notificationById)
        } catch (error) {
            // Chamar o handleErrors para formatar o erro
            const errorResponse = handleErrors(error);

            // Retornar a resposta formatada
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { DeleteNotificationController }

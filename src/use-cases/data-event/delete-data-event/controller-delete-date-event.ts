import { Response } from "express";
import { handleErrors } from "../../../errors/error-handler";
import { DeleteDateEventUseCase } from "./use-case-delete-data-event";
import { deleteDateEventRequestParamSchema } from "../../../zod/dataEvent/delete-date-event-param-schema";
import { AuthenticatedRequest } from "../../../types/authenticated-request";
import { syncDateEventToGoogle, DateEventForSync } from "../../../services/google-calendar-sync-service";

class DeleteDateEventController {
    constructor(private deleteDateEventUseCase: DeleteDateEventUseCase) { }
    async handle(req: AuthenticatedRequest, resp: Response) {
        try {
            const param = deleteDateEventRequestParamSchema.parse(req.params);
            const response = await this.deleteDateEventUseCase.execute(param.dateEventId);
            const userId = req.user?.id;
            if (userId && response?.data) {
                await syncDateEventToGoogle(userId, response.data as DateEventForSync, "delete");
            }
            return resp.json(response);
        } catch (error) {
            const errorResponse = handleErrors(error);
            return resp.status(errorResponse.statusCode).json(errorResponse.body);
        }
    }
}

export { DeleteDateEventController }
